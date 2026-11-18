---
id: tok-modelling
title: Modelling a token economy in code
level: advanced
minutes: 40
summary: Turn a design into a model, run scenarios and stress tests in Python, and present results honestly.
---

## Why model

A model forces vague ideas ("emissions will reward the community") into numbers you can question ("emissions add 18% supply in year one while projected fee burn removes 2%"). Its job is to **compare designs and find failure modes**, not to predict a price. Anyone who claims their model predicts token prices is selling something.

## The modelling process

1. **Goals**: what must the design achieve? (Secure the network, reward long-term users, fund development for five years.)
2. **Actors**: who participates, and what do they want? (Team, investors, stakers, LPs, users, speculators.)
3. **Flows**: every source of new supply and every sink, as a function of time and behaviour.
4. **Assumptions**: user growth, fees per user, what share of unlocked tokens get sold. Write them down explicitly.
5. **Scenarios**: bear, base and bull versions of the assumptions.
6. **Stress tests**: extreme but plausible shocks.
7. **Decide**: change the design until it survives the bad scenarios.

Start in a spreadsheet; move to code when you need many scenarios, randomness or agent behaviour. Use the [Tokenomics Simulator](#token-sim) for the supply side first.

## A supply and sell-pressure model in Python

```bash
uv init token-model && cd token-model
uv add pandas matplotlib
```

```python
# model.py
import pandas as pd

MAX_SUPPLY = 1_000_000_000
ALLOCATIONS = {
    # name: (share, tge_unlock, cliff_months, vest_months, sell_ratio_of_unlocks)
    "team":       (0.18, 0.00, 12, 36, 0.20),
    "investors":  (0.17, 0.00, 12, 24, 0.50),
    "ecosystem":  (0.25, 0.05,  0, 48, 0.30),
    "community":  (0.15, 0.00,  0, 48, 0.40),
    "treasury":   (0.12, 0.10,  6, 36, 0.10),
    "liquidity":  (0.07, 1.00,  0,  0, 0.00),
    "airdrop":    (0.06, 0.50,  0,  6, 0.60),
}

def unlocked(month, tge, cliff, vest):
    if month < cliff:
        return tge
    if vest == 0:
        return 1.0
    return tge + (1 - tge) * min(1.0, (month - cliff) / vest)

def run(months=48, monthly_buy_usd=1_500_000, price=0.10):
    rows, prev = [], {name: 0.0 for name in ALLOCATIONS}
    for m in range(months + 1):
        row = {"month": m, "circulating": 0.0, "sell_tokens": 0.0}
        for name, (share, tge, cliff, vest, sell_ratio) in ALLOCATIONS.items():
            amount = share * MAX_SUPPLY * unlocked(m, tge, cliff, vest)
            new = amount - prev[name]
            prev[name] = amount
            row["circulating"] += amount
            row["sell_tokens"] += new * sell_ratio
        row["sell_usd"] = row["sell_tokens"] * price
        row["buy_usd"] = monthly_buy_usd
        row["pressure_ratio"] = row["sell_usd"] / row["buy_usd"]   # above 1 means more sellers than buyers at this price
        rows.append(row)
    return pd.DataFrame(rows)

if __name__ == "__main__":
    for name, buy in {"bear": 500_000, "base": 1_500_000, "bull": 4_000_000}.items():
        df = run(monthly_buy_usd=buy)
        worst = df.loc[df["pressure_ratio"].idxmax()]
        months_over = int((df["pressure_ratio"] > 1).sum())
        print(f"{name:>4}: worst month {int(worst.month)} (ratio {worst.pressure_ratio:.1f}), "
              f"{months_over} months with more selling than buying")
```

```bash
uv run model.py
```

This is deliberately simple. It already answers useful questions: which months need the most demand, how sensitive the design is to investor selling, and whether moving the investor cliff from 12 to 18 months helps.

## Going further

- **Monte Carlo**: draw assumptions (growth, sell ratios) from ranges instead of single values, run thousands of times, and report the spread of outcomes, not one line.
- **Agent-based models**: simulate individual holders with simple rules ("stake if APY > 8%, sell 30% of unlocks if price fell this month") and watch emergent behaviour. Frameworks: **radCAD** or **cadCAD** in Python.
- **Real data**: calibrate assumptions against similar live tokens using Dune queries (actual staking rates, holder behaviour around unlocks, fee revenue).

## Stress tests to always run

| Shock | Question |
|---|---|
| Price falls 80% for 12 months | Is the treasury still funded? Do stakers stay? |
| Demand stays flat for two years | How bad is unlock pressure? |
| Largest holder sells everything | What happens to pool prices and governance? |
| Fee revenue falls 90% | Does real yield vanish and stakers leave? |
| Emissions doubled by a governance vote | Can the design survive its own governance? |

## Presenting results honestly

- Lead with the assumptions and the scenario ranges.
- Show charts of supply, unlocks and pressure, not price predictions.
- State what the model does not capture (sentiment, market-wide crashes, regulation).
- Keep the code and data public so others can check it. That transparency is itself a trust signal.

:::pro Portfolio project
Pick a real token with a published schedule. Rebuild its unlock model, compare it with on-chain data, run the three scenarios, and write a two-page memo with charts and recommendations. That one piece of work demonstrates more tokenomics skill than any certificate.
:::

## Quiz

? What is a tokenomics model best used for?
- [ ] Predicting the exact future token price
- [x] Comparing designs and finding failure modes under different assumptions
- [ ] Replacing a legal review
> Models test designs. They cannot predict markets.

? Why run bear, base and bull scenarios instead of one forecast?
- [x] Outcomes depend heavily on uncertain assumptions; a design should survive the bad cases, not just the expected one
- [ ] Investors require exactly three scenarios
- [ ] It makes the charts look better
> Robust designs are judged by their worst plausible outcomes.

? In the Python model, what does a pressure_ratio above 1 mean?
- [ ] The token is undervalued
- [x] In that month, the dollar value of expected selling from unlocks exceeds assumed buying demand at that price
- [ ] Unlocks have finished
> It flags months where the design needs more demand than assumed to hold the price.
