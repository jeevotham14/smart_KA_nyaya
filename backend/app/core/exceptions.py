class ModelArtifactError(Exception):
    def __init__(self, detail: str, error_code: str):
        self.detail = detail
        self.error_code = error_code
        super().__init__(self.detail)

class InputValidationError(Exception):
    def __init__(self, detail: str, error_code: str):
        self.detail = detail
        self.error_code = error_code
        super().__init__(self.detail)

class ModelIntegrityError(Exception):
    def __init__(self, detail: str, error_code: str):
        self.detail = detail
        self.error_code = error_code
        super().__init__(self.detail)
