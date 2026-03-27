import csv
import random
from datetime import datetime, timedelta

accounts = [f"ACC_{i:03d}" for i in range(1, 201)]

start_time = datetime(2024, 1, 1, 9, 0, 0)

with open("transactions_1000.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"])

    for i in range(1, 1001):
        sender = random.choice(accounts)
        receiver = random.choice(accounts)
        amount = random.randint(100, 10000)
        time = start_time + timedelta(minutes=random.randint(1, 50000))

        writer.writerow([
            f"T{i:04d}",
            sender,
            receiver,
            amount,
            time.strftime("%Y-%m-%d %H:%M:%S")
        ])

print("transactions_1000.csv generated")