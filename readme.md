# Discord_bot
discord bot with multiple function, create by perryChung

### Install package
1. For Node_modules, command `npm i` to install specific packages.
2. For Python packages:
    - `pip install requests`
    - `pip install pandas`
    - `pip install jieba`
    - `pip install numpy`
    - `pip install matplotlib.pyplot`
    - `pip install wordcloud`
    - `pip install PIL`
    - `pip install bs4`
    - `pip install sys`
    - note that current python environment is running on local at `C:/ProgramData/Anaconda3/python.exe`,

### Start the BOT server
command `node PBot` to start the bot server.

### Command Instruction
- `##join` to let the BOT join current audio channel
- `##leave` to make the BOT leave current audio channel
- `##play {youtube link}` to play video / add to query
- `##pause` to pause the song currently playing
- `##resume` to continue playing the song which is paused
- `##queue` to check the song query
- `##load` to load songs that stored in songs.json
- `##add {youtube link}` to add song video lonk to songs.json
- `##remove {youtube link}` to find and remove matched data saved in songs.json
- `##img {tag1 tag2 tag3 ...}` to search images (the first 3 matched) from google
- `##key {content}` to find main key by TF-IDF algorithm
- `##cloud {PTT post's link}` to generate word cloud image from PTT with TF-IDF algorithm
- `##quiz` to randomly get a question data from AnimeQ.json and store to quiz list (key will be user's name and value will be the question data)
- `##ans {your answer}` to check whether it is matched with question data's name value, if true then remove from quiz list
- `##end_quiz` to forced remove from quiz list