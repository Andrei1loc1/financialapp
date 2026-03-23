#!/usr/bin/env python3
"""
What-If Simulator Prediction Script
====================================

This script provides accurate predictions for the What-If financial simulator.
It calculates how many days your current balance will last based on different 
expense configurations.

The simulator formula:
    - dailyExpense = totalMonthlyExpenses / 30
    - days = currentBalance / dailyExpense
    
Author: Financier AI
"""

import json
import sys
from typing import Optional, Dict, Any


def predict_days(
    current_balance: float,
    food: float = 450,
    transport: float = 120,
    entertainment: float = 300,
    subscriptions: float = 150
) -> Dict[str, Any]:
    """
    Predict the number of days the current balance will last.
    
    Args:
        current_balance: The current account balance
        food: Monthly food expenses (default: 450)
        transport: Monthly transport expenses (default: 120)
        entertainment: Monthly entertainment/going out expenses (default: 300)
        subscriptions: Monthly subscription expenses (default: 150)
    
    Returns:
        Dictionary with prediction details
    """
    # Calculate total monthly expenses
    total_expenses = food + transport + entertainment + subscriptions
    
    # Calculate daily expenses (divide by 30 days)
    daily_expenses = total_expenses / 30
    
    # Calculate days until balance runs out
    if daily_expenses > 0:
        days = round(current_balance / daily_expenses)
    else:
        days = float('inf')  # Infinite if no expenses
    
    # Base scenario (default values)
    base_total = 450 + 120 + 300 + 150  # 1020
    base_daily = base_total / 30
    base_days = round(current_balance / base_daily) if base_daily > 0 else 0
    
    # Calculate difference from base
    diff = days - base_days
    
    return {
        "input": {
            "current_balance": current_balance,
            "expenses": {
                "food": food,
                "transport": transport,
                "entertainment": entertainment,
                "subscriptions": subscriptions
            }
        },
        "prediction": {
            "total_monthly_expenses": total_expenses,
            "daily_expenses": round(daily_expenses, 2),
            "estimated_days": days,
            "base_days": base_days,
            "difference": diff
        },
        "interpretation": {
            "days_label": f"{days} zile estimate",
            "difference_label": f"+{diff} zile" if diff > 0 else f"{diff} zile" if diff < 0 else "Fără modificări"
        }
    }


def get_base_prediction(current_balance: float) -> Dict[str, Any]:
    """
    Get prediction for the base/default expense configuration.
    
    Args:
        current_balance: The current account balance
    
    Returns:
        Dictionary with base prediction
    """
    return predict_days(
        current_balance=current_balance,
        food=450,
        transport=120,
        entertainment=300,
        subscriptions=150
    )


def optimize_expenses(
    current_balance: float,
    target_days: int,
    min_food: float = 100,
    max_food: float = 800,
    min_transport: float = 0,
    max_transport: float = 400,
    min_entertainment: float = 0,
    max_entertainment: float = 600,
    min_subscriptions: float = 0,
    max_subscriptions: float = 300
) -> Optional[Dict[str, Any]]:
    """
    Find the expense configuration that achieves the target number of days.
    
    Args:
        current_balance: The current account balance
        target_days: The target number of days
        min/max: Expense limits for each category
    
    Returns:
        Dictionary with optimized expenses or None if not achievable
    """
    target_daily = current_balance / target_days
    target_monthly = target_daily * 30
    
    # Try different combinations
    best_config = None
    best_diff = float('inf')
    
    # Iterate through food (most flexible)
    for food in range(int(min_food), int(max_food) + 1, 10):
        for transport in range(int(min_transport), int(max_transport) + 1, 10):
            for entertainment in range(int(min_entertainment), int(max_entertainment) + 1, 10):
                for subscriptions in range(int(min_subscriptions), int(max_subscriptions) + 1, 10):
                    total = food + transport + entertainment + subscriptions
                    
                    if total > 0:
                        days = round(current_balance / (total / 30))
                        diff = abs(days - target_days)
                        
                        if diff < best_diff:
                            best_diff = diff
                            best_config = {
                                "food": food,
                                "transport": transport,
                                "entertainment": entertainment,
                                "subscriptions": subscriptions,
                                "total": total,
                                "days": days
                            }
    
    if best_config and best_diff <= 1:
        return {
            "target_days": target_days,
            "achieved_days": best_config["days"],
            "expenses": {
                "food": best_config["food"],
                "transport": best_config["transport"],
                "entertainment": best_config["entertainment"],
                "subscriptions": best_config["subscriptions"]
            },
            "total_monthly": best_config["total"]
        }
    
    return None


def simulate_scenario(
    current_balance: float,
    monthly_income: float,
    expenses: Dict[str, float]
) -> Dict[str, Any]:
    """
    Comprehensive scenario simulation including savings rate.
    
    Args:
        current_balance: Current account balance
        monthly_income: Monthly income
        expenses: Dictionary of expense categories
    
    Returns:
        Comprehensive simulation results
    """
    total_expenses = sum(expenses.values())
    monthly_savings = monthly_income - total_expenses
    
    # Days until balance runs out (no income)
    days_no_income = round(current_balance / (total_expenses / 30)) if total_expenses > 0 else float('inf')
    
    # Days considering monthly income
    if monthly_savings > 0:
        # How long until savings cover emergency fund
        emergency_fund_target = total_expenses * 3  # 3 months expenses
        months_to_emergency = emergency_fund_target / monthly_savings
    else:
        months_to_emergency = None
    
    return {
        "balance": current_balance,
        "income": monthly_income,
        "expenses": expenses,
        "total_expenses": total_expenses,
        "monthly_savings": monthly_savings,
        "savings_rate": round((monthly_savings / monthly_income) * 100, 1) if monthly_income > 0 else 0,
        "days_until_depleted": days_no_income,
        "months_to_3_month_emergency_fund": round(monthly_savings / (total_expenses * 3), 1) if monthly_savings > 0 and total_expenses > 0 else None
    }


# CLI Interface
def main():
    """Command-line interface for the prediction script."""
    if len(sys.argv) < 2:
        print("What-If Simulator Prediction Script")
        print("=" * 40)
        print()
        print("Usage: python predict.py <command> [options]")
        print()
        print("Commands:")
        print("  predict <balance> [food] [transport] [entertainment] [subscriptions]")
        print("  - Predict days until balance runs out")
        print()
        print("  base <balance>")
        print("  - Get base prediction with default values")
        print()
        print("  optimize <balance> <target_days>")
        print("  - Find expense config to achieve target days")
        print()
        print("  scenario <balance> <income> <food> <transport> <entertainment> <subscriptions>")
        print("  - Comprehensive scenario simulation")
        print()
        print("Examples:")
        print("  python predict.py predict 2840 450 120 300 150")
        print("  python predict.py base 5000")
        print("  python predict.py optimize 2840 60")
        print("  python predict.py scenario 2840 5000 450 120 300 150")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    try:
        if command == "predict":
            balance = float(sys.argv[2]) if len(sys.argv) > 2 else 2840
            food = float(sys.argv[3]) if len(sys.argv) > 3 else 450
            transport = float(sys.argv[4]) if len(sys.argv) > 4 else 120
            entertainment = float(sys.argv[5]) if len(sys.argv) > 5 else 300
            subscriptions = float(sys.argv[6]) if len(sys.argv) > 6 else 150
            
            result = predict_days(balance, food, transport, entertainment, subscriptions)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "base":
            balance = float(sys.argv[2]) if len(sys.argv) > 2 else 2840
            result = get_base_prediction(balance)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "optimize":
            balance = float(sys.argv[2]) if len(sys.argv) > 2 else 2840
            target = int(sys.argv[3]) if len(sys.argv) > 3 else 60
            result = optimize_expenses(balance, target)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "scenario":
            balance = float(sys.argv[2]) if len(sys.argv) > 2 else 2840
            income = float(sys.argv[3]) if len(sys.argv) > 3 else 5000
            food = float(sys.argv[4]) if len(sys.argv) > 4 else 450
            transport = float(sys.argv[5]) if len(sys.argv) > 5 else 120
            entertainment = float(sys.argv[6]) if len(sys.argv) > 6 else 300
            subscriptions = float(sys.argv[7]) if len(sys.argv) > 7 else 150
            
            result = simulate_scenario(
                balance, income,
                {"food": food, "transport": transport, "entertainment": entertainment, "subscriptions": subscriptions}
            )
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
