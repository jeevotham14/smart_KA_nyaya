from app.api.routes import admin, ai, auth, complaints, directory, documents, legal_aid, notifications, tracker, women_protection

routers = [
    auth.router,
    ai.router,
    legal_aid.router,
    women_protection.router,
    documents.router,
    complaints.router,
    directory.router,
    tracker.router,
    notifications.router,
    admin.router,
]
