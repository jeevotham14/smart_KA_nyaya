import os
import pandas as pd
import glob

# PHASE A
folder = r"C:\Users\HP-VICTUS\Downloads\CJPE-main\CJPE-main\Data\ILDC_multi"
parquet_files = glob.glob(os.path.join(folder, "*.parquet"))

print("Exact filenames:", [os.path.basename(f) for f in parquet_files])
print("Exact path:", folder)

total_size = sum(os.path.getsize(f) for f in parquet_files)
print(f"File size: {total_size / (1024*1024):.2f} MB")

dfs = []
for f in parquet_files:
    df = pd.read_parquet(f)
    df['split'] = 'train' if 'train' in f else ('dev' if 'dev' in f else 'test')
    dfs.append(df)

df_all = pd.concat(dfs, ignore_index=True)

print("Number of rows:", len(df_all))
print("Column names:", list(df_all.columns))

if 'split' in df_all.columns:
    print("Split counts:\n", df_all['split'].value_counts())
else:
    print("Split column missing! Deriving splits from filenames...")

if 'label' in df_all.columns:
    print("Label counts:\n", df_all['label'].value_counts())

print("\n--- SAMPLE TEXT (REAL LEGAL JUDGMENT CHECK) ---")
for i in range(3):
    text = df_all.iloc[i]['text']
    print(f"\nSample {i+1} Extract:\n{text[:500]}...")

print("\nDATA_SOURCE = REAL_ILDC_MULTI")

# PHASE B - Leakage Investigation
print("\n--- PHASE B: LEAKAGE INVESTIGATION ---")

# Look at train + dev only
df_train_dev = df_all[df_all['split'].isin(['train', 'dev'])]

# Search for outcome-indicating phrases
patterns = [
    r"appeal\s+allowed", r"appeal\s+dismissed", r"petition\s+allowed", r"petition\s+dismissed",
    r"we\s+allow", r"we\s+dismiss", r"accordingly\s+allowed", r"stands\s+dismissed",
    r"set\s+aside", r"disposed\s+of", r"no\s+merit", r"fails", r"rejected", r"accepted"
]

import re
for p in patterns:
    matches = df_train_dev['text'].str.contains(p, case=False, na=False, regex=True).sum()
    print(f"Pattern '{p}': {matches} matches")

# Let's inspect the end of a few documents to see if it's always at the end
print("\n--- END OF DOCUMENT INSPECTION ---")
import random
random.seed(42)
sample_indices = df_train_dev[df_train_dev['text'].str.contains(r"appeal\s+dismissed", case=False, na=False)].index.tolist()
for idx in random.sample(sample_indices, 3):
    text = df_all.iloc[idx]['text']
    print(f"\nDocument {idx} - Last 500 characters:\n{text[-500:]}")
    
