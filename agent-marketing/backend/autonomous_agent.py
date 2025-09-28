
import time
import agent
import schedule

def job():
    try:
        print("--- Starting Autonomous Cycle ---")
        if agent.run_health_check():
            agent.run_strategy_cycle()
        else:
            print("Skipping strategy cycle due to health check failure.")
        print("--- Autonomous Cycle Finished ---")
    except Exception as e:
        print(f"FATAL ERROR during autonomous cycle: {e}")
        print("Agent will continue and attempt the next cycle as scheduled.")

# Schedule the job to run every 24 hours
schedule.every(24).hours.do(job)

print("Autonomous agent started. Waiting for scheduled job...")

# Run the job once immediately
job()

while True:
    schedule.run_pending()
    time.sleep(1)
