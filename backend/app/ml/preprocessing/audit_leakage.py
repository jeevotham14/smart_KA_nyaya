import os
import re
import glob
import json
import logging
import pandas as pd
import numpy as np
import random
from app.ml.preprocessing.leakage_cleaner import clean_document, OUTCOME_PHRASES, OUTCOME_REGEX

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_audit():
    logger.info("Loading REAL ILDC dataset...")
    folder = r"C:\Users\HP-VICTUS\Downloads\CJPE-main\CJPE-main\Data\ILDC_multi"
    parquet_files = glob.glob(os.path.join(folder, "*.parquet"))
    
    dfs = []
    for f in parquet_files:
        df = pd.read_parquet(f)
        df['split'] = 'train' if 'train' in f else ('dev' if 'dev' in f else 'test')
        dfs.append(df)
        
    df_all = pd.concat(dfs, ignore_index=True)
    
    # Work only with train and dev
    df = df_all[df_all['split'].isin(['train', 'dev'])].copy()
    
    logger.info(f"Processing {len(df)} Train/Dev documents...")
    
    results = []
    before_matches = 0
    after_matches = 0
    
    spot_checks = {"high": [], "medium": [], "none": []}
    
    explicit_regex = re.compile(r'\b(appeal allowed|appeal dismissed|petition allowed|petition dismissed)\b', re.IGNORECASE)
    
    for idx, row in df.iterrows():
        # Quick check for speed
        if not OUTCOME_REGEX.search(row['text']):
            res = {
                "document_id": str(idx),
                "cleaning_action": "none",
                "trigger_position": 0.0,
                "confidence": "low",
                "trigger_patterns": [],
                "original_length": len(row['text']),
                "cleaned_length": len(row['text']),
                "cleaned_text": row['text']
            }
        else:
            res = clean_document(str(idx), row['text'])
            
        results.append(res)
        
        action_key = "none"
        if res['cleaning_action'] == 'truncate':
            action_key = "high"
        elif res['cleaning_action'] == 'sentence_mask':
            action_key = "medium"
            
        if len(spot_checks[action_key]) < 3:
            spot_checks[action_key].append({
                "DOCUMENT ID": str(idx),
                "ACTION": res['cleaning_action'],
                "TRIGGER": res['trigger_patterns'],
                "BEFORE EXCERPT": row['text'][-500:],
                "AFTER EXCERPT": res['cleaned_text'][-500:]
            })
            
        if explicit_regex.search(row['text']):
            before_matches += 1
        if explicit_regex.search(res['cleaned_text']):
            after_matches += 1
            
    df_res = pd.DataFrame(results)
    
    stats = {
        "total_documents": len(df_res),
        "documents_unchanged": len(df_res[df_res['cleaning_action'] == 'none']),
        "documents_sentence_masked": len(df_res[df_res['cleaning_action'] == 'sentence_mask']),
        "documents_truncated": len(df_res[df_res['cleaning_action'] == 'truncate']),
    }
    
    pct_removed = (df_res['original_length'] - df_res['cleaned_length']) / df_res['original_length'] * 100
    
    stats["average_text_removed_percentage"] = float(pct_removed.mean())
    stats["median_text_removed_percentage"] = float(pct_removed.median())
    stats["maximum_text_removed_percentage"] = float(pct_removed.max())
    stats["documents_lost_more_than_30_pct"] = float((pct_removed > 30).sum() / len(df_res) * 100)
    stats["documents_lost_less_than_5_pct"] = float((pct_removed < 5).sum() / len(df_res) * 100)
    
    confidence_dist = df_res['confidence'].value_counts().to_dict()
    
    leakage_stats = {
        "documents_with_explicit_verdict_before": before_matches,
        "documents_with_explicit_verdict_after": after_matches,
        "percentage_removed": float((before_matches - after_matches) / before_matches * 100) if before_matches > 0 else 0
    }
    
    print("\\n--- CLEANING STATISTICS ---")
    print(json.dumps(stats, indent=2))
    print("\\n--- CONFIDENCE DISTRIBUTION ---")
    print(json.dumps(confidence_dist, indent=2))
    print("\\n--- LEAKAGE AUDIT ---")
    print(json.dumps(leakage_stats, indent=2))
    
    print("\\n--- SPOT CHECKS ---")
    for conf, checks in spot_checks.items():
        print(f"\\n[{conf.upper()} CONFIDENCE SAMPLES]")
        for c in checks:
            print(f"DOCUMENT ID: {c['DOCUMENT ID']}")
            print(f"ACTION: {c['ACTION']}")
            print(f"TRIGGER: {c['TRIGGER']}")
            print(f"BEFORE EXCERPT: ...{c['BEFORE EXCERPT']}")
            print(f"AFTER EXCERPT: ...{c['AFTER EXCERPT']}")
            print("ASSESSMENT: PASS / QUESTIONABLE") 
            print("-" * 50)
            
    artifacts_dir = os.path.join(os.path.dirname(__file__), '../artifacts/preprocessing')
    with open(os.path.join(artifacts_dir, 'cleaning_report.json'), 'w') as f:
        json.dump(stats, f, indent=4)
    with open(os.path.join(artifacts_dir, 'leakage_audit_after.json'), 'w') as f:
        json.dump(leakage_stats, f, indent=4)
    with open(os.path.join(artifacts_dir, 'cleaner_version.json'), 'w') as f:
        json.dump({"version": "1.0-conservative"}, f, indent=4)

if __name__ == '__main__':
    run_audit()
