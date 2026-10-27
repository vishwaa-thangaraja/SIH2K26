"""CLI for the editable demonstration bureau mapping."""
import argparse
from src.bureau_recommendation import recommend_bureau


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("category", nargs="?")
    parser.add_argument("--override", help="User-selected bureau/cell label")
    args = parser.parse_args()
    while True:
        category = args.category if args.category is not None else input("Category (or 'exit'): ")
        if category.strip().casefold() == "exit":
            break
        print(recommend_bureau(category, override=args.override))
        if args.category is not None:
            break


if __name__ == "__main__":
    main()
