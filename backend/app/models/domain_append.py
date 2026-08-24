import sqlalchemy as sa

class ConsultationBroadcast(Base, TimestampMixin):
    __tablename__ = "consultation_broadcasts"

    id: Mapped[uuid.UUID] = uuid_pk()
    citizen_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id"), index=True)
    legal_category: Mapped[str] = mapped_column(String(120))
    district: Mapped[str] = mapped_column(String(100), index=True)
    preferred_language: Mapped[str] = mapped_column(String(50))
    consultation_mode: Mapped[str] = mapped_column(String(20))
    short_summary: Mapped[str] = mapped_column(Text)
    preferred_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    pro_bono_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(40), default="OPEN")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    citizen = relationship("User")
    recipients = relationship("ConsultationBroadcastRecipient", back_populates="broadcast")
    responses = relationship("ConsultationBroadcastResponse", back_populates="broadcast")


class ConsultationBroadcastRecipient(Base):
    __tablename__ = "consultation_broadcast_recipients"

    id: Mapped[uuid.UUID] = uuid_pk()
    broadcast_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultation_broadcasts.id", ondelete="CASCADE"), index=True)
    advocate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("advocate_profiles.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    broadcast = relationship("ConsultationBroadcast", back_populates="recipients")
    advocate = relationship("AdvocateProfile")


class ConsultationBroadcastResponse(Base, TimestampMixin):
    __tablename__ = "consultation_broadcast_responses"

    id: Mapped[uuid.UUID] = uuid_pk()
    broadcast_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultation_broadcasts.id", ondelete="CASCADE"), index=True)
    advocate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("advocate_profiles.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(40), default="INTERESTED")
    advocate_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    proposed_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    consultation_mode: Mapped[str] = mapped_column(String(20))

    broadcast = relationship("ConsultationBroadcast", back_populates="responses")
    advocate = relationship("AdvocateProfile")

    __table_args__ = (
        sa.UniqueConstraint("broadcast_id", "advocate_id", name="uq_broadcast_advocate_response"),
    )
