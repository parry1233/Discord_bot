from transformers import BertTokenizer, BartForConditionalGeneration, Text2TextGenerationPipeline
tokenizer = BertTokenizer.from_pretrained("uer/bart-base-chinese-cluecorpussmall")
model = BartForConditionalGeneration.from_pretrained("uer/bart-base-chinese-cluecorpussmall")
text2text_generator = Text2TextGenerationPipeline(model, tokenizer)
print(text2text_generator("你[MASK] [MASK]了", max_length=50, do_sample=False)[0]['generated_text'])