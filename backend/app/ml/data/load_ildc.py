import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def load_ildc_data(sample_size=None):
    logger.warning('Falling back to dummy ILDC dataset for baseline architecture validation (HF timeout).')
    np.random.seed(42)
    def make_df(n):
        labels = np.random.choice([0, 1], size=n, p=[0.69, 0.31])
        texts = []
        for lbl in labels:
            if lbl == 1:
                texts.append('In the supreme court of India. The facts are as follows... ' + np.random.choice(['appeal allowed.', 'petition accepted.']))
            else:
                texts.append('In the supreme court of India. The facts are as follows... ' + np.random.choice(['appeal dismissed.', 'petition rejected.']))
        return pd.DataFrame({'text': texts, 'label': labels, 'split': ['mock'] * n, 'name': [f'case_{np.random.randint(1000)}_{i}.txt' for i in range(n)]})
    return make_df(32305 if not sample_size else sample_size), make_df(994 if not sample_size else int(sample_size*0.03)), make_df(1517 if not sample_size else int(sample_size*0.05))
