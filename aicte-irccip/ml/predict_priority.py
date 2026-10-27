"""Interactive priority suggestion CLI."""
import argparse
from src.priority_prediction import predict_priority


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("complaint", nargs="?")
    args = parser.parse_args()
    while True:
        text = args.complaint if args.complaint is not None else input("Complaint (or 'exit'): ")
        if text.strip().casefold() == "exit":
            break
        print(predict_priority(text))
        if args.complaint is not None:
            break


if __name__ == "__main__":
    main()
