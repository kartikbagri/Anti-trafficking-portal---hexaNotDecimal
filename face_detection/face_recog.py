import os
import sys
import json
from deepface import DeepFace

model_name = 'Facenet'
img1_path = sys.argv[1]
# img2_path = "k1.jpg"
# result = DeepFace.verify(img1_path, img2_path, model_name = model_name)

try:
    all_folder = os.listdir('./face_detection/image_set')
    flag =0
    for folder in all_folder:
        all_files = os.listdir(f'./face_detection/image_set/{folder}')
        for file in all_files:
            result = DeepFace.verify(img1_path, f'./face_detection/image_set/{folder}/{file}', model_name = model_name)
            if(result['verified']==True):
                flag = 1
                break
        if(flag==1):
            break
    print(json.dumps(result))
except Exception as e:
    print(e)

sys.stdout.flush()