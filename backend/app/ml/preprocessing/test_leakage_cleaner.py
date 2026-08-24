import unittest
from app.ml.preprocessing.leakage_cleaner import clean_document

class TestLeakageCleaner(unittest.TestCase):
    
    def test_outcome_in_first_20_percent(self):
        # 10 sentences. Sentence 1 has outcome. pos = 1/10 = 0.1
        text = "Hello world. The appeal is dismissed early on. " + "Filler sentence. " * 8
        res = clean_document("1", text)
        self.assertEqual(res['cleaning_action'], 'none')
        self.assertIn("appeal is dismissed", res['cleaned_text'])

    def test_outcome_around_50_percent(self):
        # 10 sentences. Sentence 5 has outcome. pos = 5/10 = 0.5
        text = "Filler sentence. " * 5 + "The appeal fails. " + "Filler sentence. " * 4
        res = clean_document("2", text)
        self.assertEqual(res['cleaning_action'], 'none')

    def test_outcome_around_70_percent(self):
        # 10 sentences. Sentence 7 has outcome. pos = 7/10 = 0.7
        text = "Filler sentence. " * 7 + "The appeal fails. " + "Filler sentence. " * 2
        res = clean_document("3", text)
        self.assertEqual(res['cleaning_action'], 'sentence_mask')
        self.assertNotIn("petition is allowed", res['cleaned_text'])

    def test_outcome_around_95_percent(self):
        # 20 sentences. Sentence 19 has outcome. pos = 19/20 = 0.95
        text = "Filler sentence. " * 19 + "The appeal is dismissed."
        res = clean_document("4", text)
        self.assertEqual(res['cleaning_action'], 'truncate')
        self.assertNotIn("appeal is dismissed", res['cleaned_text'])

    def test_explicit_final_transition_plus_outcome(self):
        # 10 sentences. Sentence 8 (0.8) has transition + outcome.
        text = "Filler sentence. " * 8 + "In the result, the appeal is allowed. " + "Filler sentence. "
        res = clean_document("5", text)
        self.assertEqual(res['cleaning_action'], 'truncate')

    def test_lower_court_decision(self):
        # 10 sentences. Sentence 8 (0.8) has lower court + outcome.
        text = "Filler sentence. " * 8 + "The high court set aside the order. " + "Filler sentence. "
        res = clean_document("6", text)
        self.assertEqual(res['cleaning_action'], 'none')
        self.assertIn("set aside", res['cleaned_text'])

    def test_final_supreme_court_disposition(self):
        # Very end.
        text = "Facts of the case. Arguments were heard. Accordingly, we dismiss the appeal."
        res = clean_document("7", text)
        self.assertEqual(res['cleaning_action'], 'truncate')
        self.assertNotIn("we dismiss", res['cleaned_text'])

if __name__ == '__main__':
    unittest.main()
