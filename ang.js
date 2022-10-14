function get_map(s) {
    let map = new Map();

    for (let i = 0; i < s.length; i++) {
        if (map.has(s[i])) { // If current char in map, increment by 1
            map.set(s[i], map.get(s[i]) + 1);
        }
        else { // Else set to 1
            map.set(s[i], 1);
        }
    }
    return map;
}

function map_to_string(m) {
    let s = "";

    for (let k of m.keys()) {
        s = s.concat(k.repeat(m.get(k)));
    }

    return s;
}

function derive(needle, haystack) { // These arguments are maps (not strings!)
    let n_map = needle; // no need to duplicate this as we don't alter it
    let h_map = new Map(haystack); // duplicate this because we alter it as we go

    let n_keys = n_map.keys();

    for (let key of n_keys) {
        if (h_map.has(key)) {
            let haystack_count = h_map.get(key);
            let needle_count = n_map.get(key);

            if (haystack_count == needle_count) { // If the same number of this letter exists in both maps, delete the last one from haystack.
                h_map.delete(key);
            }
            else if (haystack_count > needle_count) { // If haystack has more of this letter than needle, decrement haystack accordingly.
                h_map.set(key, haystack_count - needle_count);
            }
            else if (haystack_count < needle_count) { // If needle has more of this letter than haystack, we can't derive needle from haystack.
                return false;
            }
        }
        else { // There is a letter in needle that doesn't exist in haystack, so we can't derive.
            return false;
        }
    }

    return h_map; // Return what's left of the haystack map to show what letters are left over.
}

class ang_trie_node {
    constructor(parent, word, fodder) { // parent node, word (string), fodder (map)
        this.children = [];
        this.word = word;
        this.fodder = fodder;
        this.parent = parent;

        if (this.word != null) { // if this is not the root node
            this.word_map = get_map(word);
            this.child_fodder = derive(this.word_map, fodder);
        }
        else { // this is the root node
            this.child_fodder = fodder;
        }
    }

    birth_children() {
        if (this.parent != null) { // if this is not the root node
            for (const sibling of this.parent.children) {
                let new_child_fodder = derive(sibling.word_map, this.fodder);
                if (new_child_fodder != false) {
                    this.children.push(new ang_trie_node(this, sibling.word, new_child_fodder));
                }
            }
        }
    }

    recurse() { // only call this once the node has children or it won't do anything
        if (this.children.length > 0) {
            for (const child of this.children) {
                child.birth_children();
                child.recurse();
            }
        }
    }
}

function tree_to_anagrams(root_node, max_depth) { // non-recursive function using a stack to walk tree and find anagrams
    let anagrams = [];
    let stack = [];

    stack.push(root_node);

    while(stack.length > 0) {
        const n = stack.pop();

        if (n.fodder.size == 0) { // we found an anagram
            let buf = "";
            // iterate back to the root of the tree, adding words to the buffer as we go
            let current_node = n;
            while (current_node.parent != null) {
                buf = " ".concat(current_node.word, buf);
                current_node = current_node.parent;
            }
            anagrams.push(buf);
        }

        for(child of n.children) {
            stack.push(child);
        }
    }

    return(anagrams);
}

function prep_string(s) { // convert to lowercase and strip all non-alpha characters
    return s.toLowerCase().replace(/[^a-z]/gi, "");
}

// TODO: pass messages back as anagrams found rather than all at once
self.onmessage = function (e) {
    var start_time = new Date().getTime();
    const worker_data = e.data;
    const chunk_size = 100;
    
    let root_node = new ang_trie_node(null, null, get_map(prep_string(worker_data.phrase))); // make the root node

    // set up the root node
    var root_node_start_time = new Date().getTime();
    for (const w of worker_data.dict_words) { // for every word in the dictionary...
        let pw = prep_string(w);
        //let pw = w;
        let new_child_fodder = derive(get_map(pw), root_node.child_fodder); // derive it from the phrase if we can
        if (new_child_fodder != false) { // if we have derived something, add it as a child of the root node
            root_node.children.push(new ang_trie_node(root_node, pw, new_child_fodder));
        }
    }
    var root_node_time_spent = new Date().getTime() - root_node_start_time;
    console.log("Root node created in", root_node_time_spent / 1000, "seconds.")

    var tree_build_start_time = new Date().getTime();
    root_node.recurse();
    var tree_build_time_spent = new Date().getTime() - tree_build_start_time;
    console.log("Tree built in", tree_build_time_spent / 1000, "seconds.")

    var tree_walk_start_time = new Date().getTime();
    //anagrams = tree_to_anagrams(root_node, 1, worker_data.max_words);
    anagrams = tree_to_anagrams(root_node, worker_data.max_words);
    var tree_walk_time_spent = new Date().getTime() - tree_walk_start_time;
    console.log("Tree walked in", tree_walk_time_spent / 1000, "seconds.")
    
    var total_time_spent = new Date().getTime() - start_time;

    var the_status = " ".concat("Found ", anagrams.length, " anagrams of <i>", worker_data.phrase, "</i> in ", total_time_spent / 1000, " seconds.");
    console.log(the_status);

    anagrams.reverse();

    // send back anagrams in chunks
    for (let i = 0; i < anagrams.length; i += chunk_size) {
        const chunk = anagrams.slice(i, i + chunk_size);
        postMessage({anagrams: chunk, the_status: "results"});
    }
    
    postMessage({n_anagrams: anagrams.length, total_seconds: total_time_spent / 1000, phrase: worker_data.phrase, the_status: "done"});
}