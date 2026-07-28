from app.api.routes import admin, ai, auth, complaints, directory, documents, guided_intake, legal_aid, notifications, tracker, women_protection, workspace

routers = [
    auth.router,
    ai.router,
    guided_intake.router,
    legal_aid.router,
    women_protection.router,
    documents.router,
    complaints.router,
    directory.router,
    tracker.router,
    notifications.router,
    workspace.router,
    admin.router,
]
