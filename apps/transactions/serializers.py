import json
import logging
from decimal import Decimal

from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from rest_framework import serializers

from apps.transactions.base import StrictModelSerializer
from apps.transactions.models import PromptTemplate, Status, Transaction

logger = logging.getLogger(__name__)

TRANSACTION_PROMPT_NAME = "transaction_analysis"


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""

    class Meta:
        model = Transaction
        fields = [
            "id",
            "user",
            "status",
            "type",
            "description",
            "merchant_name",
            "amount",
            "total_amount",
            "currency",
            "payment_method",
            "is_installment",
            "installment",
            "installment_total",
            "due_date",
        ]
        read_only_fields = ["id", "user"]


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "type",
            "description",
            "merchant_name",
            "amount",
            "is_installment",
            "installment",
            "installment_total",
            "due_date",
        ]

    def create(self, validated_data):
        validated_data["status"] = Status.ACTIVE
        validated_data["total_amount"] = validated_data["amount"]
        validated_data["currency"] = validated_data.get("currency", "BRL")
        return super().create(validated_data)

    @staticmethod
    def create_from_ai_response(user, payload: dict) -> Transaction:

        return Transaction.objects.create(
            user=user,
            status=Status.ACTIVE,
            type=payload.get("type", "expense"),
            payment_method=payload.get("payment_method", ""),
            description=payload.get("description"),
            merchant_name=payload.get("merchant_name"),
            amount=Decimal(str(payload.get("amount", 0))),
            total_amount=Decimal(str(payload.get("total_amount", payload.get("amount", 0)))),
            currency=payload.get("currency", "BRL"),
            is_installment=payload.get("is_installment", False),
            installment=payload.get("installment"),
            installment_total=payload.get("installment_total"),
            due_date=payload.get("due_date"),
        )


class TransactionUpdateSerializer(StrictModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "type",
            "payment_method",
            "description",
            "merchant_name",
            "amount",
            "is_installment",
            "installment",
            "installment_total",
            "due_date",
        ]


class TransactionExtractionSerializer(serializers.Serializer):
    text = serializers.CharField(required=True, allow_blank=False)

    @property
    def llm(self):
        if not hasattr(self, "_llm"):
            self._llm = init_chat_model("gpt-5.4-mini")
        return self._llm

    @staticmethod
    def _get_prompt_template() -> str:
        try:
            template = PromptTemplate.objects.get(name=TRANSACTION_PROMPT_NAME, is_active=True)
            return template.content
        except PromptTemplate.DoesNotExist:
            raise ValueError("not found prompt template")

    def create(self, validated_data) -> dict:
        prompt_user = validated_data["text"]
        request = self.context.get("request")
        user = request.user if request else None

        prompt_template = self._get_prompt_template()
        prompt_text = prompt_template.format(user_input=prompt_user)

        messages = [
            SystemMessage(content="You extract structured financial transaction data."),
            HumanMessage(content=prompt_text),
        ]

        try:
            response = self.llm.invoke(messages)
            content = response.content
            if isinstance(content, str):
                raw_content = content.strip()
            elif isinstance(content, list):
                raw_content = "".join(
                    item if isinstance(item, str) else str(item) for item in content
                ).strip()
            else:
                raw_content = str(content).strip()

            data = json.loads(raw_content)
            TransactionCreateSerializer.create_from_ai_response(user, data)
        except json.JSONDecodeError:
            logger.error("OpenAI returned non-JSON response: %s", raw_content)
            raise ValueError("OpenAI returned an invalid JSON response.")
        except Exception as e:
            logger.error("Error processing AI response: %s", str(e))
            raise ValueError("An error occurred while processing the AI response.")

        return {
            "request": {
                "user_input": prompt_user,
                "prompt": prompt_text,
            },
            "response": data,
        }
