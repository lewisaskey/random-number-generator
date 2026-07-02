"""A simple random number generator app."""

import random


def generate_number(low: int, high: int) -> int:
    """Return a random integer between low and high (inclusive)."""
    return random.randint(low, high)


def main() -> None:
    print("=== rng ===")
    while True:
        try:
            low = int(input("Enter minimum value (or Ctrl+C to quit): "))
            high = int(input("Enter maximum value: "))
        except ValueError:
            print("Please enter valid integers.\n")
            continue
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break

        if low > high:
            print("Minimum must not be greater than maximum.\n")
            continue

        number = generate_number(low, high)
        print(f"Your random number: {number}\n")


if __name__ == "__main__":
    main()


