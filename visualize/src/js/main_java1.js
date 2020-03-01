window.onload = function () {
    var flask = new CodeFlask;
    var defaultCode = "class WordsOfEqChars \n" +
    "{\n" +
    "    main(args)\n" +
    "    {\n" +
    "        var url = new URL('https://wiki.puzzlers');\n" +
    "        var isr = new inputStream(url.openStream());\n" +
    "        var reader = new BufferReader(isr);\n" +
    "        var anagrams = new HashMap();\n" +
    "        var count = 0;\n" +
    "        while((word = reader.readline()) != null)\n" +
    "        {\n" +
    "            var chars = word.toCharArray();\n" +
    "            var key = new String(chars);\n" +
    "            if(!anagrams.containsKey(key))\n" +
    "            {\n" +
    "                anagrams.put(key, new ArrayList());\n" +
    "                anagrams.get(key).add(word);\n" +
    "                count = Math.max();\n" +
    "            }\n" +
    "        }\n" +
    "        reader.close();\n" +
    "        var ana;\n" +
    "        for(ana=0;ana<anagrams.values();ana= ana+ 1)\n" +
    "        {\n" +
    "            console.log(ana);\n" +
    "        }\n" +
    "    }\n" +
    "}\n" +
    "var n1 = new WordsOfEqChars();\n" +
    "n1.main();";
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
