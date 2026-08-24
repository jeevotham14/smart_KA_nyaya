import os
import glob
import pandas as pd
import re
import json

def run_broader_audit():
    raw_folder = r"C:\Users\HP-VICTUS\Downloads\CJPE-main\CJPE-main\Data\ILDC_multi"
    clean_folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    
    # Load raw
    raw_dfs = []
    for f in glob.glob(os.path.join(raw_folder, "*.parquet")):
        if 'test' in f: continue
        raw_dfs.append(pd.read_parquet(f))
    df_raw = pd.concat(raw_dfs, ignore_index=True)
    
    # Load clean
    clean_dfs = []
    for f in glob.glob(os.path.join(clean_folder, "*_clean_v1.parquet")):
        clean_dfs.append(pd.read_parquet(f))
    df_clean = pd.concat(clean_dfs, ignore_index=True)
    
    # Ensure aligned by id
    df_raw = df_raw.set_index('id').sort_index()
    df_clean = df_clean.set_index('id').sort_index()
    
    categories = {
        "A_explicit": r'\b(appeal is allowed|appeal is dismissed|petition is allowed|petition is dismissed|stands allowed|stands dismissed|we allow|we dismiss)\b',
        "B_final_order": r'\b(impugned judgment is set aside|judgment is affirmed|conviction is upheld|conviction is set aside|acquitted|appeal succeeds|appeal fails)\b',
        "C_transition_outcome": r'\b(for the foregoing reasons|in the result|accordingly|therefore).{1,50}(allowed|dismissed|set aside|rejected|accepted)\b'
    }
    
    results = {}
    
    for cat_name, pattern in categories.items():
        regex = re.compile(pattern, re.IGNORECASE)
        before = df_raw['text'].str.contains(regex).sum()
        after = df_clean['text'].str.contains(regex).sum()
        results[cat_name] = {
            "before": int(before),
            "after": int(after),
            "reduction_pct": float((before - after) / max(1, before) * 100)
        }
        
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    run_broader_audit()
