"""Interactive complaint category prediction CLI."""
import argparse
from src.classification import predict_category


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("complaint", nargs="?", help="Complaint text; omit for interactive mode")
    args = parser.parse_args()
    if args.complaint is not None:
        result = predict_category(args.complaint)
        print("Predicted category:", result["category"])
        if "confidence_estimate" in result:
            print(f"Confidence estimate: {result['confidence_estimate']:.3f} ({result['confidence_note']})")
        return
    print("=== CASELINK Complaint Classifier (type 'exit' to quit) ===")
    while True:
        try:
            text = input("\nComplaint: ")
        except EOFError:
            break
        if text.strip().casefold() == "exit":
            break
        try:
            result = predict_category(text)
            print("Predicted category:", result["category"])
            if "confidence_estimate" in result:
                print(f"Confidence estimate: {result['confidence_estimate']:.3f} (uncalibrated)")
        except ValueError as exc:
            print(f"Input error: {exc}")


if __name__ == "__main__":
    main()
