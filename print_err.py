with open(r"C:\Users\HP-VICTUS\.gemini\antigravity\brain\ec0e4554-3a21-447c-9296-5753574b21bd\.system_generated\tasks\task-8089.log", 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'FAILED backend/tests/test_advocates.py::test_get_advocates_filtering' in line:
            start = max(0, i - 15)
            for j in range(start, i + 5):
                if j < len(lines):
                    print(lines[j].strip())
