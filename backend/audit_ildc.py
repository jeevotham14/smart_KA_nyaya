import os
import re
import pandas as pd
from datasets import load_dataset

# We will try to download the dataset from Hugging Face since the local CSVs are missing
try:
    print("Loading dataset from Hugging Face: Exploration-Lab/ILDC")
    ds = load_dataset("Exploration-Lab/ILDC")
except Exception as e:
    print(f"Error loading dataset from HF: {e}")
    exit(1)
    
def print_stats(df, split_name):
    print(f"\n--- {split_name.upper()} SPLIT STATS ---")
    print(f"Number of rows: {len(df)}")
    
    if len(df) == 0:
        return
        
    print(f"Columns: {list(df.columns)}")
    print(f"Data types:\n{df.dtypes}")
    print(f"Missing values:\n{df.isnull().sum()}")
    
    if "label" in df.columns:
        counts = df["label"].value_counts()
        print(f"Label 0 count: {counts.get(0, 0)} ({counts.get(0, 0)/len(df)*100:.2f}%)")
        print(f"Label 1 count: {counts.get(1, 0)} ({counts.get(1, 0)/len(df)*100:.2f}%)")
    
    if "text" in df.columns:
        lengths = df["text"].astype(str).str.len()
        word_lengths = df["text"].astype(str).str.split().str.len()
        print(f"Min text length (chars): {lengths.min()}")
        print(f"Max text length (chars): {lengths.max()}")
        print(f"Mean text length (chars): {lengths.mean():.2f}")
        print(f"Median text length (chars): {lengths.median()}")
        print(f"Mean word length: {word_lengths.mean():.2f}")
        
        empty = (word_lengths == 0).sum()
        short = (word_lengths < 10).sum()
        print(f"Empty documents: {empty}")
        print(f"Extremely short documents (<10 words): {short}")
        
        # Leakage investigation
        leakage_patterns = [
            r"appeal allowed", r"appeal dismissed", r"petition accepted", 
            r"petition rejected", r"final order", r"we allow the appeal", 
            r"we dismiss the appeal"
        ]
        
        total_leakage = 0
        for pattern in leakage_patterns:
            matches = df["text"].astype(str).str.contains(pattern, case=False, na=False).sum()
            print(f"Leakage pattern '{pattern}': {matches} matches")
            total_leakage += matches
            
        print(f"Total potential leakage markers: {total_leakage}")

if 'ds' in locals():
    # Convert HF dataset to Pandas DataFrames
    df_train = ds["train"].to_pandas()
    df_dev = ds["validation"].to_pandas()
    df_test = ds["test"].to_pandas()
    
    # Check for duplicates across splits (using 'name' if available, otherwise text)
    if 'name' in df_train.columns:
        train_names = set(df_train['name'])
        dev_names = set(df_dev['name'])
        test_names = set(df_test['name'])
        
        print("\n--- SPLIT OVERLAP ANALYSIS ---")
        print(f"Train/Dev overlap: {len(train_names.intersection(dev_names))}")
        print(f"Train/Test overlap: {len(train_names.intersection(test_names))}")
        print(f"Dev/Test overlap: {len(dev_names.intersection(test_names))}")
    
    print_stats(df_train, "train")
    print_stats(df_dev, "dev")
    print_stats(df_test, "test")
