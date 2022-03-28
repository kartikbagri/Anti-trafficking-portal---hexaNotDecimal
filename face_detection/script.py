from deepface import DeepFace
import sys

model_name = 'VGG-Face'
img1_path = sys.argv[1]
img2_path = sys.argv[2]
# img1 = DeepFace.detectFace(img1_path)
# img2 = DeepFace.detectFace(img2_path)
try:
    result = DeepFace.verify(img1_path, img2_path, model_name = model_name)
    print(result)
except Exception as e:
    print(e)

sys.stdout.flush()