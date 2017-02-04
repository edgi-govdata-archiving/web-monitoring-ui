
# coding: utf-8

# In[62]:

import requests
import json


# In[63]:

def get_PF_diff(url1, url2):
    a = requests.post("https://api1.pagefreezer.com/v1/api/utils/diff/compare", 
                  data=json.dumps({"url1":url1, "url2":url2}) , 
                  headers= { "Accept": "application/json", "Content-Type": "application/json", "x-api-key": "SP949Hsfdm2z9rYbnb9mC588hO2uV3Nna2pcy1cj"})
    return a.json()


# In[64]:

h = get_PF_diff('https://www.google.com', 'https://www.bing.com')


# In[65]:

diffs = h['result']['output']['diffs']


# In[66]:

max_distance = 100 #100 characters seems far?
DELETE_TYPE = -1
CHANGE_TYPE = 0
ADDITION_TYPE = 1
chunks = []
current_offset = 0
current_change_type = -5 #this isn't valid, we'll know if something messed up when we're starting

def makeANewChunkOfChange(diff):
    new_end_of_offset = 0
    old_end_of_offset = 0
    
    # we need to set an end based on the new_ and the old_ html
    # this will change based on whether it's a 'change', an 'insertion' or a 'deletion'
    # and the length of the new and the old html offsets will differ more and more the longer a change chunk goes on
    if diff['change'] == CHANGE_TYPE:
        new_end_of_offset = diff['offset'] + diff['new'].length
        old_end_of_offset = diff['offset'] + diff['old'].length
    elif diff['change'] == DELETE_TYPE:
        new_end_of_offset = chunk.new_end
        old_end_of_offset = chunk.old_end + diff['old'].length
    elif diff['change'] == ADDITION_TYPE:
        new_end_of_offset = chunk.new_end + diff['new'].length
        old_end_of_offset = chunk.old_end
    chunk.new_end = new_end_of_offset
    chunk.old_end = old_end_of_offset
    return chunk

def addDiffToChunk(diff, chunk):
    #ASSUMPTION: the diff change type is the same as the chunk change type
    if diff.change == CHANGE_TYPE:
        new_end_of_offset = chunk.new_end + diff.new.length
        old_end_of_offset = chunk.old_end + diff.old.length
    elif diff.change == DELETE_TYPE:
        new_end_of_offset = diff.offset
        old_end_of_offset = diff.offset + diff.old.length
    elif diff.change == ADDITION_TYPE:
        new_end_of_offset = diff.offset + diff.new.length
        old_end_of_offset = diff.offset

for diff in diffs:
    #initialize the offset and change type on the first diff
    if current_offset == 0:
        brand_spankin_new_chunk = makeANewChunkOfChange(diff)
        current_offset = diff.offset
        chunks.append(brand_spankin_new_chunk)
        continue #we're initialized let's rock rock on, cheet commandos
    
    #let's check if we're in range and if we're the same change type. if either of these aren't true, make a new chunk
    current_chunk = chunks[-1]
    if diff.change == current_chunk.change and (current_chunk.old_end - diff.offset) < max_distance:
        chunks[-1] = addDiffToChunk(diff, chunk) #get the new one, update the old one, we good
    else:
        chunks.append(makeANewChunkOfChange(diff))
        


# In[ ]:



