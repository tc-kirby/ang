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

function tree_to_anagrams(root_node, depth, max_depth) {
    let anagrams = [];
    
    for (const n of root_node.children) {
        //console.log("\t".repeat(depth), n.word, "(", map_to_string(n.fodder), ")")

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

        if ((max_depth == null) || (depth < max_depth)) {
            for (let a of tree_to_anagrams(n, depth + 1, max_depth)) {
                anagrams.push(a);
            }
        }
    }

    return anagrams;
}

function prep_string(s) { // convert to lowercase and strip all non-alpha characters
    return s.toLowerCase().replace(/[^a-z]/gi, "");
}