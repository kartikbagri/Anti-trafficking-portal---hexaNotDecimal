from distutils import extension
import os
import sys
import glob
from deepface import DeepFace



model_name = 'VGG-Face'
img1_path = 'input_image/v2_test.jpg'
# img2_path = "k1.jpg"
# result = DeepFace.verify(img1_path, img2_path, model_name = model_name)

all_folder = os.listdir('./image_set')
flag =0
for folder in all_folder:
    all_files = os.listdir(f'./image_set/{folder}')
    for file in all_files:
        result = DeepFace.verify(img1_path, f'./image_set/{folder}/{file}', model_name = model_name)
        if(result['verified']==True):
            flag = 1
            break
    if(flag==1):
        break

print(result)
sys.exit()