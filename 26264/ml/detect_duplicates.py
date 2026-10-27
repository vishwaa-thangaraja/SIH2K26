"""Interactive possible-duplicate search CLI."""
import argparse
from src.duplicate_detection import find_duplicates


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("complaint", nargs="?")
    parser.add_argument("--threshold", type=float, default=0.25)
    parser.add_argument("--max-results", type=int, default=5)
    args = parser.parse_args()
    while True:
        text = args.complaint if args.complaint is not None else input("Complaint (or 'exit'): ")
        if text.strip().casefold() == "exit":
            break
        result = find_duplicates(text, threshold=args.threshold, max_results=args.max_results)
        print(result["message"])
        for row in result["matches"]:
            print(f"{row['similarity']:.3f}\t{row['complaint']}")
        if args.complaint is not None:
            break


if __name__ == "__main__":
    main()
