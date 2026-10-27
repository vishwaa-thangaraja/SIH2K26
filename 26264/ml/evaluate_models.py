"""Run category and priority holdout evaluations and save JSON reports."""
from train_classifier import main as evaluate_classifier
from train_priority import main as evaluate_priority

if __name__ == "__main__":
    evaluate_classifier()
    evaluate_priority()
