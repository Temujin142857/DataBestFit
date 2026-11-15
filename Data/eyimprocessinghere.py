import math, argparse
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from pathlib import Path

parser = argparse.ArgumentParser(
    description='get fucked'
    )
parser.add_argument('filename',
                    type=str,
                    help='hey put a fucking .csv file here, make sure it is in the all_that_bs folder'
                    )
parser.add_argument('x',
                    type=str,
                    help='independent variable for independent variabling'
                    )
parser.add_argument('y',
                    type=str,
                    help='dependent variable for dependent variabling'
                    )
parser.add_argument('title',
                    type=str,
                    help='hey we need to name the dataset something :((((( plz help ussss')
args = parser.parse_args()
filename = args.filename.strip()
x = args.x
y = args.y
title = args.title.strip()


print(filename)
df = pd.read_csv(filename)
print(df.shape)

model = LinearRegression()

model.fit(df[[x]], df[y])
m = model.coef_[0]
b = model.intercept_
angle = np.rad2deg(np.arctan(model.coef_[0]))

print(f"y = {m}x + {b}, angle is {angle} degrees")

df_out = pd.read_csv('postprocessing.csv')



