window.onload = function () {
    var flask = new CodeFlask;
    var defaultCode = "var fs = require('fs');\n" +
                "var words = fs.readFileSync('unixdict.txt', 'UTF-8').split('\\n');\n" +
                " \n" +
                "var i, item, max = 0,\n" +
                "    anagrams = {};\n" +
                " \n" +
                "for (i = 0; i < words.length; i += 1) {\n" +
                "  var key = words[i].split('').sort().join('');\n" +
                "  if (!anagrams.hasOwnProperty(key)) {//check if property exists on current obj only\n" +
                "      anagrams[key] = [];\n" +
                "  }\n" +
                "  var count = anagrams[key].push(words[i]); //push returns new array length\n" +
                "  max = Math.max(count, max);\n" +
                "}\n" +
                " \n" +
                "//note, this returns all arrays that match the maximum length\n" +
                "for (item in anagrams) {\n" +
                "  if (anagrams.hasOwnProperty(item)) {//check if property exists on current obj only\n" +
                "    if (anagrams[item].length === max) {\n" +
                "        console.log(anagrams[item].join(' '));\n" +
                "    }\n" +
                "  }\n" +
                "}";
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
