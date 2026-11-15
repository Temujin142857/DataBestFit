import math, argparse, os
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from pathlib import Path

def process_that_shit(filename:Path):
    with open(post_df_path, 'a', encoding='latin-1') as f:
        print(filename)
        df = pd.read_csv(all_that_bs_path / filename, encoding='latin-1')
        df.dropna(subset=y, inplace=True)
        print(df.shape)
        if df.shape[0] <= 0:
            print("No data found, skipping")
            return
        try:
            if df[y].value_counts()[0] == len(df[y]):
                print("No data found, skipping")
                return
        except KeyError:
            print("yippee there's no 0 at all in this whaaaat")
        
        if args.title != None:
            title = args.title.strip()
        else:
            title = f"{df['Country'].value_counts().index[0]} {y.strip().title()} ({df['Year'].values.min()} - {df['Year'].values.max()})"
        post_df = pd.read_csv(post_df_path, encoding='latin-1')

        if not(title in post_df[' title'].values): # if it isn't already in there under the same title
            model = LinearRegression()
            model.fit(df[[x]], df[y])
            m = model.coef_[0]
            b = model.intercept_
            angle = np.rad2deg(np.arctan(model.coef_[0]))
        
            print(f"y = {m}x + {b}, angle is {angle} degrees")

            f.write(f"\n{filename},{title},{x},{y},{m},{b},{angle}")
            f.close()


parser = argparse.ArgumentParser(
    description='get fucked'
    )
parser.add_argument('x',
                    type=str,
                    help='independent variable for independent variabling'
                    )
parser.add_argument('y',
                    type=str,
                    help='dependent variable for dependent variabling'
                    )
parser.add_argument('--filename',
                    type=str,
                    help='hey put a fucking .csv file here, make sure it is in the all_that_bs folder'
                    )
parser.add_argument('--title',
                    type=str,
                    help='hey we need to name the dataset something :((((( plz help ussss')
args = parser.parse_args()
x = args.x
y = args.y

if os.path.basename(Path.cwd()) != 'Data':
    all_that_bs_path = Path.cwd() / 'Data' / 'all_that_bs'
elif os.path.basename(Path.cwd()) == 'Data':
    all_that_bs_path = Path.cwd() / 'all_that_bs'
print(all_that_bs_path)
post_df_path = all_that_bs_path.parent/'postprocessing.csv'

if args.filename != None:
    process_that_shit(args.filename.strip())
else:
    for f in [i for i in all_that_bs_path.glob('**/*')]:
        process_that_shit(os.path.basename(f))


    
    

    

    

    

    
            