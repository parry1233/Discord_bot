import requests
import pandas as pd
import jieba.analyse
import numpy as np
import matplotlib.pyplot as plt

from wordcloud import WordCloud
from PIL import Image
from bs4 import BeautifulSoup

import sys 
#print('running...')
link = sys.argv[1]
#print(link)

req = requests.session()
pc_list = req.get(link,verify=False)
pc_soup = BeautifulSoup(pc_list.text)
file_temp=[]
title_name = pc_soup('title')[0].text
#print(title_name)
words = []

for i in pc_soup.select('.push-content'):
    imp = jieba.analyse.extract_tags(i.text[1:],topK=3)
    #print(i.text[1:],imp)
    for keyword in imp:
        words.append(keyword)

words_collect = " ".join(words)
wordCloudFileName = 'output_wordCloud.png'
img_mask = np.array(Image.open('nvidia.png'))
wordCloudResult = WordCloud(background_color='white',mask=img_mask,font_path='SoukouMincho.ttf').generate(words_collect)
plt.figure(figsize=(20,20))
plt.imshow(wordCloudResult)
plt.axis("off")
##plt.show()
wordCloudResult.to_file(wordCloudFileName)
print(wordCloudFileName)