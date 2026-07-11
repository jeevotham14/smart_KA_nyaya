from sqlalchemy import JSON, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.types import UserDefinedType

JSONVariant = JSON().with_variant(JSONB, "postgresql")
TextArray = JSON().with_variant(ARRAY(Text), "postgresql")


class Vector(UserDefinedType):
    cache_ok = True

    def __init__(self, dimensions: int = 1536):
        self.dimensions = dimensions

    def get_col_spec(self, **_kw):
        return f"VECTOR({self.dimensions})"
