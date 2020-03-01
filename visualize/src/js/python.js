var anagram, count, words;
words = urllib.request.urlopen("http://wiki.puzzlers.org/pub/wordlists/unixdict.txt").read().split();
anagram = defaultdict(list);
for (var word, _pj_c = 0, _pj_a = words, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
    word = _pj_a[_pj_c];
    anagram[tuple(sorted(word))].append(word);
}
count = anagram[0].length;
for (var ana, _pj_c = 0, _pj_a = anagram.values(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
    ana = _pj_a[_pj_c];
    if ((count < ana.length)) {
        count = ana.length;
    }
}
for (var ana, _pj_c = 0, _pj_a = anagram.values(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
    ana = _pj_a[_pj_c];
    if ((ana.length >= count)) {
        console.log(function () {
    var _pj_d = [], _pj_e = ana;
    for (var _pj_f = 0, _pj_g = _pj_e.length; (_pj_f < _pj_g); _pj_f += 1) {
        var x = _pj_e[_pj_f];
        _pj_d.push(x.decode());
    }
    return _pj_d;
}
.call(this));
    }
}

//# sourceMappingURL=python.js.map
