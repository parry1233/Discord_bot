from allennlp.predictors.predictor import Predictor
import allennlp_models.rc

predictor = Predictor.from_path("https://storage.googleapis.com/allennlp-public-models/bidaf-elmo.2021-02-11.tar.gz")
ans = predictor.predict(
    passage="A reusable launch system (RLS, or reusable launch vehicle, RLV) is a launch system which is capable of launching a payload into space more than once. This contrasts with expendable launch systems, where each launch vehicle is launched once and then discarded. No completely reusable orbital launch system has ever been created. Two partially reusable launch systems were developed, the Space Shuttle and Falcon 9. The Space Shuttle was partially reusable: the orbiter (which included the Space Shuttle main engines and the Orbital Maneuvering System engines), and the two solid rocket boosters were reused after several months of refitting work for each launch. The external tank was discarded after each flight.",
    question="How many partially reusable launch systems were developed?"
)
print(ans['best_span_str'])