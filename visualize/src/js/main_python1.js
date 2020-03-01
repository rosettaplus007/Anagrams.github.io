window.onload = function () {
    var flask = new CodeFlask;
    var defaultCode = "/* Largest anagram groups found in list of words. */\n" +
    "function main() {\n" +
    "    /* Largest anagram groups in local unixdict.txt */\n" +
    "    console.log(unlines(largestAnagramGroups(lines(readFile(\"unixdict.txt\")))));\n" +
    "}\n" +
    "function largestAnagramGroups(ws) {\n" +
    "    /*A list of the anagram groups of\n" +
    "    of the largest size found in a\n" +
    "    given list of words.\n" +
    "    */\n" +
    "    var groups, intMax;\n" +
    "    function wordChars(w) {\n" +
    "        /*A word paired with its\n" +
    "        AZ sorted characters\n" +
    "        */\n" +
    "        return [\"\".join(sorted(w)), w];\n" +
    "    }\n" +
    "    groups = list(map(compose(list)(snd), groupby(sorted(map(wordChars, ws), {\"key\": fst}), {\"key\": fst})));\n" +
    "    intMax = max(map(len, groups));\n" +
    "    return list(map(compose(unwords)(curry(map)(snd)), filter(compose(curry(eq)(intMax))(len), groups)));\n" +
    "}\n" +
    "function compose(g) {\n" +
    "    /* Right to left function composition. */\n" +
    "    return (f) => {\n" +
    "    return (x) => {\n" +
    "    return g(f(x));\n" +
    "};\n" +
    "};\n" +
    "}\n" +
    "function curry(f) {\n" +
    "    /*A curried function derived\n" +
    "    from an uncurried function.*/\n" +
    "    return (a) => {\n" +
    "    return (b) => {\n" +
    "    return f(a, b);\n" +
    "};\n" +
    "};\n" +
    "}\n" +
    "function fst(tpl) {\n" +
    "    /* First member of a pair. */\n" +
    "    return tpl[0];\n" +
    "}\n" +
    "function lines(s) {\n" +
    "    /*A list of strings,\n" +
    "    (containing no newline characters)\n" +
    "    derived from a single new-line delimited string.*/\n" +
    "    return s.splitlines();\n" +
    "}\n" +
    "function readFile(fp) {\n" +
    "    /*The contents of any file at the path\n" +
    "    derived by expanding any ~ in fp.*/\n" +
    "}\n" +
    "function snd(tpl) {\n" +
    "    /* Second member of a pair. */\n" +
    "    return tpl[1];\n" +
    "}\n" +
    "function unlines(xs) {\n" +
    "    /*A single string derived by the intercalation\n" +
    "    of a list of strings with the newline character.*/\n" +
    "    return \"\\n\".join(xs);\n" +
    "}\n" +
    "function unwords(xs) {\n" +
    "    /*A space-separated string derived from\n" +
    "    a list of words.*/\n" +
    "    return \" \".join(xs);\n" +
    "}\n" +
    "if ((__name__ === \"__main__\")) {\n" +
    "    main();\n" +
    "}\n" +
    "\n" +
    "//# sourceMappingURL=python.js.map\n";
    flask.run('#my-code-wrapper', {
        language: 'js'
    });

    flask.update(defaultCode);
    renderVisuals(generateAst(defaultCode));

    flask.onUpdate(function (code) {
        $('#test1').empty();
        $('#test2').empty();
        var ast = generateAst(code);
        console.log(ast)
        renderVisuals(ast);
    });

    function generateAst(code) {
        var ast = esprima.parse(code);
        console.log(ast)
        traverse(ast, {
            pre: function (node) {
                if (node.body && !Array.isArray(node.body)) {
                    node.body = [node.body];
                }
                node.children = node.body ? node.body : [];
            }
        });
        return ast;
    }

    function renderVisuals(ast) {
        renderTree(document.getElementById("test1"), ast);
        renderAnalysis(document.getElementById("test2"), ast);
        renderAst(document.getElementById("test3"), ast);
    }

    function renderAst(container, ast) {
        var astEditor = new CodeFlask;
        var code = JSON.stringify(ast, null, 4);
        astEditor.run('#ast-wrapper', {
            language: 'js'
        });
        astEditor.update(code);
    }

    function renderAnalysis(container, ast) {
        var ast = Object.assign({}, ast);
        var hash = {};
        traverse(ast, {
            pre: function (node) {
                delete node.children;
            },
            post: function (node) {
                hash.hasOwnProperty(node.type) ? hash[node.type] = hash[node.type] + 1 : hash[node.type] = 1;
            }
        });

        var $table = $('<table class="highlight"/>');
        var $tbody = $table.append('<tbody></tbody>');
        for (var prop in hash) {
            $tbody.append('<tr><td>' + prop + '</td><td>' + hash[prop] + '</td></tr>');
        }
        $(container).append($table);
    }

    function renderTree(container, ast) {
        var treeData = ast;

        var margin = {top: 40, right: 90, bottom: 50, left: 90},
            width = 660 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var treemap = d3.tree()
            .size([width, height]);

        var nodes = d3.hierarchy(treeData);

        nodes = treemap(nodes);

        var svg = d3.select(container).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom),
            g = svg.append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        var link = g.selectAll(".link")
            .data(nodes.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                return "M" + d.x + "," + d.y
                    + "C" + d.x + "," + (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," + d.parent.y;
            });

        var node = g.selectAll(".node")
            .data(nodes.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                return "node" +
                    (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("circle")
            .attr("r", 10);

        node.append("text")
            .attr("dy", ".35em")
            .attr("y", function (d) {
                return d.children ? -20 : 20;
            })
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.data.type;
            });
    }
};
