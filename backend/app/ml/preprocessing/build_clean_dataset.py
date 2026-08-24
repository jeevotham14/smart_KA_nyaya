import os
import glob
import json
import logging
import pandas as pd
from datetime import datetime
from app.ml.preprocessing.leakage_cleaner import clean_document

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def build_clean_datasets():
    logger.info("Building cleaned datasets...")
    folder = r"C:\Users\HP-VICTUS\Downloads\CJPE-main\CJPE-main\Data\ILDC_multi"
    parquet_files = glob.glob(os.path.join(folder, "*.parquet"))
    
    out_dir = os.path.join(os.path.dirname(__file__), '../data/processed')
    os.makedirs(out_dir, exist_ok=True)
    
    # Process files
    total_docs = 0
    total_unchanged = 0
    total_truncated = 0
    total_masked = 0
    total_pct_removed = []
    
    source_info = []
    
    for f in parquet_files:
        basename = os.path.basename(f)
        if 'train' in f:
            split = 'train'
        elif 'dev' in f:
            split = 'dev'
        else:
            continue # skip test
            
        logger.info(f"Processing {basename} ({split})...")
        df = pd.read_parquet(f)
        source_info.append({"filename": basename, "rows": len(df)})
        
        cleaned_records = []
        for idx, row in df.iterrows():
            res = clean_document(f"{basename}_{idx}", row['text'])
            
            # Record stats
            total_docs += 1
            if res['cleaning_action'] == 'none':
                total_unchanged += 1
            elif res['cleaning_action'] == 'truncate':
                total_truncated += 1
            elif res['cleaning_action'] == 'sentence_mask':
                total_masked += 1
                
            pct_rem = (res['original_length'] - res['cleaned_length']) / max(1, res['original_length']) * 100
            total_pct_removed.append(pct_rem)
            
            cleaned_records.append({
                "id": row['id'],
                "label": row['label'],
                "split": split,
                "text": res['cleaned_text'],
                "cleaner_action": res['cleaning_action'],
                "cleaner_confidence": res['confidence']
            })
            
        df_clean = pd.DataFrame(cleaned_records)
        out_path = os.path.join(out_dir, f"{basename.split('.')[0]}_clean_v1.parquet")
        df_clean.to_parquet(out_path)
        logger.info(f"Saved {out_path}")
        
    avg_removed = sum(total_pct_removed) / max(1, len(total_pct_removed))
    
    manifest = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cleaner_version": "1.0-conservative",
        "source_files": source_info,
        "metrics": {
            "total_documents_processed": total_docs,
            "documents_unchanged": total_unchanged,
            "documents_truncated": total_truncated,
            "documents_sentence_masked": total_masked,
            "average_text_removed_percentage": avg_removed
        }
    }
    
    manifest_path = os.path.join(out_dir, "preprocessing_manifest.json")
    with open(manifest_path, 'w') as mf:
        json.dump(manifest, mf, indent=4)
        
    logger.info("Clean dataset build complete.")

if __name__ == '__main__':
    build_clean_datasets()
