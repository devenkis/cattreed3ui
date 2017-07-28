function close_modal() {
        //VTRAO fix
        $(document).foundation('reveal', 'close');
}

var tree_root;
var create_node_modal_active = false;
var rename_node_modal_active = false;
var create_node_parent = null;
var node_to_rename = null;
var server_url = null;
var expandallfunction;
var collapseallfunction;
var centreCategoryTree;
var resetCategoryTree;
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};


//vtrao: custom function for loading new nodes with server calls
function create_node_byfetch(parentnode, node){
      if (parentnode) {
          //handle toggleChildren
          if (parentnode._children != null)  {
                  parentnode.children = parentnode._children;
                  parentnode._children = null;
          }
          if (parentnode.children == null) {
                  parentnode.children = [];
          }
          new_node = { 'name': node.name,
                       'id' :  node.id,
                       'depth': parentnode.depth + 1,
                       'children': [],
                       '_children':null,
                       'catName': node.catName,
                       'description': node.description,
                       'siblingNumber': node.siblingNumber,
                       'parentId': node.parentId
                     };
          console.log('vtrao: Create Node by fetch: ' + name);
          parentnode.children.push(new_node);
        }
}

//vtrao: modify
function create_node() {
        if (create_node_parent && create_node_modal_active) {
                if (create_node_parent._children != null)  {
                        create_node_parent.children = create_node_parent._children;
                        create_node_parent._children = null;
                }
                if (create_node_parent.children == null) {
                        create_node_parent.children = [];
                }
                id = generateUUID(); //vtrao get this from db after creation of node
                name = $('#CreateNodeName').val();
                catName = $('#CreateNodeCatName').val();
                description = $('#CreateNodeDescription').val();
                new_node = { 'name': name,
                             'id' :  id,
                             'depth': create_node_parent.depth + 1,
                             'children': [],
                             '_children':null,
                             'catName': catName,
                             'description': description,
                             'siblingNumber': 0,
                             'parentId': create_node_parent.id
                           };
                 new_node_toserver = {
                                'name': name,
                                'id' :  -100,
                                'children': [],
                                'catName': catName,
                                'description': description,
                                'parentId': create_node_parent.id
                 };
                 $.ajax({
                     url: server_url,
                     type: 'POST',
                     data: JSON.stringify(new_node_toserver),
                     contentType: 'application/json',
                     dataType: 'json',
                     async: false,
                     success: retdata => {
                       console.log("vtrao: in create node callback: "+ retdata.id);
                       console.log('vtrao: Create Node: ' + new_node.id);
                       new_node.id = retdata.id;
                       new_node.siblingNumber = retdata.siblingNumber;
                       console.log('vtrao: Create Node: ' + new_node.id + " " + new_node.name);
                       create_node_parent.children.push(new_node);
                       create_node_modal_active = false;
                       $('#CreateNodeName').val('');
                       $('#CreateNodeCatName').val('');
                       $('#CreateNodeDescription').val('');
                     }
                   });
        }
        close_modal();
        outer_update(create_node_parent);
}



//vtrao: modify for update
function rename_node() {
        if (node_to_rename && rename_node_modal_active) {
                name = $('#RenameNodeName').val();
                catName = $('#RenameNodeCatName').val();
                description = $('#RenameNodeDescription').val();
                console.log('vtrao: updateNode before: ' + node_to_rename);
                node_to_rename.name = name;
                node_to_rename.catName = catName;
                node_to_rename.description = description;
                rename_node_modal_active = false;
                console.log('vtrao: pdateNode after: ' + node_to_rename);
                new_node_toserver = {
                               'name': name,
                               'id' :  node_to_rename.id,
                               'children': [],
                               'catName': catName,
                               'description': description,
                               'parentId': node_to_rename.parentId,
                               'siblingNumber': node_to_rename.siblingNumber
                              };
                console.log(new_node_toserver.id);
                console.log(new_node_toserver.parentId);
                console.log(new_node_toserver.name);
                console.log(new_node_toserver.children);
                console.log(node_to_rename._children);
                $.ajax({
                    url: server_url,
                    type: 'PUT',
                    data: JSON.stringify(new_node_toserver),
                    contentType: 'application/json',
                    dataType: 'json',
                    async: false,
                    success: retdata => {
                      console.log("vtrao: in update node callback: " + retdata);
                      close_modal();
                      outer_update(node_to_rename);
                    }
                  });
        }

}

outer_update = null;

function draw_tree(error, treeData) {
    server_url = $('#server').val();
    console.log("vtrao: initial draw_tree: configured to: " + server_url);

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;

    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;

    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height()*0.5;

    var tree = d3.layout.tree()//.nodeSize([70, 40])
        //gap between the nodes: vtrao
        //.separation(function(a, b) { return ((a.parent == root) && (b.parent == root)) ? 5 : 3; })
        .size([viewerHeight, viewerWidth]);

    //edit the link distance : vtrao
    //var force = d3.layout.force();
    //force.linkDistance = 10;

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    var menu = [
            {       //vtrao: edit node from rename node
                    title: 'Edit Cateogy',
                    action: function(elm, d, i) {
                            console.log('Edit Category');
                            $("#RenameNodeName").val(d.name);
                            $("#RenameNodeCatName").val(d.catName);
                            $("#RenameNodeDescription").val(d.description);
                            rename_node_modal_active = true;
                            node_to_rename = d
                            $("#RenameNodeName").focus();
                            $('#RenameNodeModal').foundation('reveal', 'open');
                    }
            },
            {
                    title: 'Delete Category',
                    action: function(elm, d, i) {
                            console.log('Delete Category');
                            delete_node(d);
                    }
            },
            {
                    title: 'Create Category',
                    action: function(elm, d, i) {
                            console.log('Create Category');
                            create_node_parent = d;
                            create_node_modal_active = true;
                            $('#CreateNodeModal').foundation('reveal', 'open');
                            $('#CreateNodeName').focus();
                    }
            }
    ]


    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });

    //vtrao: modify
    function delete_node(node) {
        console.log("vtrao: delete_node: node: "+ node);
        $.ajax({
            url: server_url+"/"+node.id,
            type: 'DELETE',
            dataType: 'json',
            async: false,
            success: function(retdata) {
              console.log("vtrao: in delete node callback: "+ retdata);
            }
          });
        visit(treeData, function(d) {
               console.log("vtrao: delete_node: d: "+ d);
               console.log("vtrao: make request to " + server_url);
               if (d.children) {
                       for (var child of d.children) {
                               if (child == node) {
                                       d.children = _.without(d.children, child);
                                       update(root);
                                       break;
                               }
                       }
               }
        },
        function(d) {
           return d.children && d.children.length > 0 ? d.children : null;
       });
    }


    // sort the tree according to the node names
    //vtrao: modify
    function sortTree() {
        if($('#sorttree').val()==="true") {
          console.log("vtrao: sort the nodes");
          tree.sort(function(a, b) {
              return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
          });
        } else {
          console.log("vtrao: dont sort the nodes");
        }

    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight);

    baseSvg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white")

    baseSvg.call(zoomListener);


    // Define the drag listeners for drag/drop behaviour of nodes.
    dragListenerDefault = d3.behavior.drag()
        .on("dragstart", function(d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on("drag", function(d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            // get coords of mouseEvent relative to svg container to allow for panning
            relCoords = d3.mouse($('svg').get(0));
            if (relCoords[0] < panBoundary) {
                panTimer = true;
                pan(this, 'left');
            } else if (relCoords[0] > ($('svg').width() - panBoundary)) {
                panTimer = true;
                pan(this, 'right');
            } else if (relCoords[1] < panBoundary) {
                panTimer = true;
                pan(this, 'up');
            } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                panTimer = true;
                pan(this, 'down');
            } else {
                try {
                    clearTimeout(panTimer);
                } catch (e) {

                }
            }

            d.x0 += d3.event.dy;
            d.y0 += d3.event.dx;
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
            //vgdrag2: three lines below first commented, next two added
            updateTempConnector();
            selectedParentNode = d.parent;
            updateTempConnectorToParent();
        }).on("dragend", function(d) {
            if (d == root) {
                return;
            }
            domNode = this;

            if (selectedNode) {
              //vdrag: this change is needed to allow drag only between nodes
              if(selectedNode === tree_root) {
                    console.log("selectedNode === tree_root " );
              } else {
                    console.log("selectedNode: selectedNode.id "+ selectedNode.id );
                    console.log("selectedNode: d.id "+ d.id );
                    console.log("selectedNode: selectedNode.parent.id "+ selectedNode.parent.id );
                    console.log("selectedNode: d.parent.id "+ d.parent.id );
                    console.log("selectedNode: selectedNode.depth "+ selectedNode.depth );
                    console.log("selectedNode: d.depth "+ d.depth );
                    if( selectedNode.parent === d.parent ) {
                        //move the draggedNode after the selectedNode
                        console.log(draggingNode.id);
                        //get selectednode siblingNumber and id
                        //get nextnode siblingNumber and id if exists
                        //update position
                        //returns a 0 if this is the last node of the parent
                        nextnodeSiblingNumber = getNextNodeSiblingNumber(d.parent, selectedNode, d);
                        console.log("siblingNumbeNextNode "+nextnodeSiblingNumber);
                        if(-1000 ===  nextnodeSiblingNumber) {
                          console.log("request not required as move is to the same position "+nextnodeSiblingNumber);
                        } else {
                          update_node_toserver = {
                               'categoryToUpdate':	{
                                              'name': d.name,
                                              'id' :  d.id,
                                              'children': [],
                                              'catName': d.catName,
                                              'description': d.description,
                                              'parentId': d.parentId,
                                              'siblingNumber': d.siblingNumber
                                             },
                               'siblingNumberPreviousNode': selectedNode.siblingNumber,
                               'siblingNumbeNextNode': nextnodeSiblingNumber
                              }

                          $.ajax({
                              url: server_url+"/position",
                              type: 'PUT',
                              data: JSON.stringify(update_node_toserver),
                              contentType: 'application/json',
                              dataType: 'json',
                              async: false,
                              success: data => {
                                console.log("vtrao: in update node callback: " + data);
                                processAndUpdateParent(d.parent, data);
                              }
                            });
                        }
                        /*
                        // now remove the element from the parent, and insert it into the new elements children
                        var index = draggingNode.parent.children.indexOf(draggingNode);
                        if (index > -1) {
                            draggingNode.parent.children.splice(index, 1);
                        }
                        if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                            if (typeof selectedNode.children !== 'undefined') {
                                selectedNode.children.push(draggingNode);
                            } else {
                                selectedNode._children.push(draggingNode);
                            }
                        } else {
                            selectedNode.children = [];
                            selectedNode.children.push(draggingNode);
                        }
                        // Make sure that the node being added to is expanded so user can see added node is correctly moved
                        expand(selectedNode);
                        sortTree();*/
                      }
              }
                endDrag();
            } else {
                endDrag();
            }
        });

        function processAndUpdateParent(parent, parentWithLatestOrder) {
            var childrenToUpdate = (parent.children)?parent.children:parent._children;
            var childrenWithLatestOrder = (parentWithLatestOrder.children)?parentWithLatestOrder.children:parentWithLatestOrder._children;

            console.log("childrenToUpdate");
            displaychildren(childrenToUpdate);
            console.log("childrenWithLatestOrder");
            displaychildren(childrenWithLatestOrder);

            var newOrderedChildren = new Array(childrenWithLatestOrder.length);
            //vtrao: this should be optimized from O(n^2)
            for( i=0; i< childrenToUpdate.length; ++i) {
              for( j=0; j<childrenWithLatestOrder.length; ++j) {
                if(childrenToUpdate[i].id === childrenWithLatestOrder[j].id) {
                  //update siblingNumber for consistency
                  childrenToUpdate[i].siblingNumber = childrenWithLatestOrder[j].siblingNumber;
                  newOrderedChildren[j]=childrenToUpdate[i];
                  break;
                  }
              }
            }
            parent.children = newOrderedChildren;

            console.log("newOrderedChildren");
            displaychildren(parent.children);

            update(parent);
            centerNode(parent);
         }

         function displaychildren(children) {
           for( i=0; i< children.length; ++i) {
             console.log("    name: "+ children[i].name);
            }
         }
        function getNextNodeSiblingNumber(parent, node, samenode) {
            var children = (parent.children)?parent.children:parent._children;
            if(children)
            {
              for( i=0; i < children.length; ++i ) {
                if(children[i].id === node.id) {
                  if( i === (children.length-1) ) {
                    console.log("should return 0 as this is the last node ");
                    return 0;
                  } else {
                    console.log("should return i+1 th siblingNumber " + children[i+1].siblingNumber + " nextnodename: " + children[i+1].name);
                    if(samenode.id === children[i+1].id) { //next node is the samenode in the children, return nextnode if applicable or 0
                        //try to move to the same earlier node
                        if((i+2) <= children.length )
                          return -1000; //stop sending a request
                        else
                          return 0;
                    } else {
                      return children[i+1].siblingNumber;
                    }
                  }
                }
              }
            }
        }

        function initiateDrag(d, domNode) {
            draggingNode = d;
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
            d3.select(domNode).attr('class', 'node activeDrag');

            svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
                if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
                else return -1; // a is the hovered element, bring "a" to the front
            });
            // if nodes has children, remove the links and nodes
            if (nodes.length > 1) {
                // remove link paths
                links = tree.links(nodes);
                nodePaths = svgGroup.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    }).remove();
                // remove child nodes
                nodesExit = svgGroup.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id;
                    }).filter(function(d, i) {
                        if (d.id == draggingNode.id) {
                            return false;
                        }
                        return true;
                    }).remove();
            }

            // remove parent link
            //vdrag1: the below block is commented out: not required anymore
            parentLink = tree.links(tree.nodes(draggingNode.parent));
            svgGroup.selectAll('path.link').filter(function(d, i) {
                if (d.target.id == draggingNode.id) {
                    return true;
                }
                return false;
            }).remove();

            dragStarted = null;
        }

    function endDrag() {
        selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        //vgdrag4: aded below function call
        updateTempConnectorToParent();
        $('#parentlink').remove();
        if (draggingNode !== null) {
            update(root);
            centerNode(draggingNode);
            draggingNode = null;
        }
    }

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.y0,
                    y: selectedNode.x0
                },
                target: {
                    x: draggingNode.y0,
                    y: draggingNode.x0
                }
            }];
        }
        var link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    //vdrag3: added new function
    var updateTempConnectorToParent = function() {
        var data = [];
        if (draggingNode !== null && selectedParentNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedParentNode.y0,
                    y: selectedParentNode.x0
                },
                target: {
                    x: draggingNode.y0,
                    y: draggingNode.x0
                }
            }];
        }
        var rootlink = svgGroup.selectAll(".templinkroot").data(data);

        rootlink.enter().append("path")
            .attr("class", "templinkroot")
            .attr("id", "parentlink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        rootlink.attr("d", d3.svg.diagonal());

        rootlink.exit().remove();
    };

        dragEndHandler = function(d) {
          console.log("in drag end handler "+d.name);
          if (d == root) {
              return;
          }
        }
        dragHandler = function(d) {
          console.log("in drag handler "+d.name);
          if (d == root) {
              return;
          }
          if (dragStarted) {
              domNode = this;
              console.log("dragggggg");
              //initiateDrag(d, domNode);
          }
        }
        dragStartHandler = function(d) {
          console.log("in drag start handler "+d.name);
          if (d == root) {
              return;
          }
          dragStarted = true;
          nodes = tree.nodes(d);
          d3.event.sourceEvent.stopPropagation();
          // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        }

        dragListenerNew = d3.behavior.drag()
          .origin(function(d) {
            return d;
          })
          .on("dragstart", dragStartHandler)
          .on('drag', dragHandler)
          .on('dragend', dragEndHandler);
    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

  // color a node properly
  function colorNode(d) {
        result = "#fff";
        if (d.synthetic == true) {
          result = (d._children || d.children) ? "darkgray" : "lightgray";
        }
        else {
          if (d.type == "USDA") {
            result = (d._children || d.children) ? "orangered" : "orange";
          } else if (d.type == "Produce") {
            result = (d._children || d.children) ? "yellowgreen" : "yellow";
          } else if (d.type == "RecipeIngredient") {
            result = (d._children || d.children) ? "skyblue" : "royalblue";
          } else {
            result = "lightsteelblue"
          }
        }
        return result;
    }




    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    function centerNode(source) {
      console.log("in centreNode "+ $('#centretree').val())
      if($('#centretree').val() === "true") {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
      } else {
        //try implementing to restore to the same initial
      }
    }

    // Toggle children function
    function toggleChildren(d) {
        //Vtrao Lazyloading
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.
    //vtrao: modify
    function click(d) {
        console.log("vtrao: onclick of " + d.children);
        if(d.children || d._children)  {
          console.log("vtrao: has children");
          if (d3.event.defaultPrevented) return; // click suppressed
          d = toggleChildren(d);
          update(d);
          centerNode(d);
        } else  {
          console.log("vtrao: no children: load now...");
          $.ajax({
              url: server_url+"/"+d.id,
              dataType: 'json',
              async: false,
              data: null,
              success: function(data) {
                console.log("vtrao: in callback: "+ data);
                console.log("vtrao: in callback: "+ d);
                if(data.children.length>0)
                {
                  for( i=0 ; i< data.children.length; ++i) {
                    create_node_byfetch(d,data.children[i]);
                  }
                  update(d);
                  centerNode(d);
                }
              }
            });
          console.log("vtrao: no children: load now after");
        }
    }

    //vtrao test fucntion to verify if we can reorder and construct the parent node children
    function reorderChildren(d) {
        var children = (d.children)?d.children:d._children;
        var newOrderedChildren = [];
        if(children)
        {
          for( i=0, j=children.length-1 ; i< children.length; ++i, --j) {
            newOrderedChildren[i] = children[j];
          }
          d.children = newOrderedChildren;
          update(d);
          centerNode(d);
        }
    }

    expandallfunction = function() {
      explandallcore(tree_root);
      //reorderChildren(tree_root);
    }
    collapseallfunction = function() {
      collapseallcore(tree_root);
    }
    centreCategoryTree = function() {
      centerNode(tree_root);
    }
    resetCategoryTree = function() {
      $.ajax({
          url: server_url+"/reset",
          type: 'POST',
          dataType: 'json',
          async: false,
          success: retdata => {
            console.log("vtrao: in resetCategoryTree callback: "+ retdata);
          }
        });
        //reload the tree by nulling all the existing data
        tree_root.children = null;
        tree_root._children = null;
        click(tree_root);
    }
/*
    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }

        var children = d.children;
        if(d._children) //this node is collapsed
          {
          children = d._children;
          d.children = children;
          d._children = null;
          }
        if (children) {
              console.log(" in if part has children: " + d.name );
              for (var child of children) {
                  explandallcore(child);
                  console.log(" in children loop: " + child.name );
              }
        } else {
              console.log(" in else part fetch: " + d.name );
              $.ajax({
                  url: server_url+"/"+d.id,
                  dataType: 'json',
                  async: false,
                  data: null,
                  success: data => {
                    console.log("vtrao: in callback: "+ data);
                    console.log("vtrao: in callback: "+ d);
                    if(data.children.length>0)
                    {
                      create_node_parent = d;
                      create_node_modal_active = false;
                      for( i=0 ; i< data.children.length; ++i) {
                        create_node_byfetch(d,data.children[i]);
                      }
                    //explandallcore(d);
                    }
                  }
                });
          }
          update(d);
          centerNode(d);
    }*/


    function expandNew(d) {
        var children = (d.children)?d.children:d._children;
        if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        if(children)
          children.forEach(expandNew);
        else {
          console.log(" in else part fetch: " + d.name );
          $.ajax({
              url: server_url+"/"+d.id,
              dataType: 'json',
              async: false,
              data: null,
              success: data => {
                console.log("vtrao: in callback: "+ data);
                console.log("vtrao: in callback: "+ d);
                if(data.children.length>0)
                {
                  for( i=0 ; i< data.children.length; ++i) {
                    create_node_byfetch(d,data.children[i]);
                  }
                update(d);
                expandNew(d);//recurse with newly added children
                //centerNode(d);
                }
              }
            });
          }
    }

    //vtrao: new function for expandall
    function explandallcore(d) {
      expandNew(root);
      update(root);
      //Algo: other try with visitation
      //visit node and toggle its children if they are hidden
      // Parentfunction just toggle its children if present, else get its children and display them
      /*visit(treeData, function(d) {
             console.log("vtrao: explandallcore: d: "+ d);
             console.log("vtrao: explandallcore make request to " + server_url);
             var children = d.children;
             if(d._children) { //this node is collapsed
                   children = d._children;
                   d.children = children;
                   d._children = null;
                   update(d);
                   centerNode(d);
               } else {
                   console.log(" in else part fetch: " + d.name );
                   $.ajax({
                       url: server_url+"/"+d.id,
                       dataType: 'json',
                       async: false,
                       data: null,
                       success: data => {
                         console.log("vtrao: in callback: "+ data);
                         console.log("vtrao: in callback: "+ d);
                         if(data.children.length>0)
                         {
                           for( i=0 ; i< data.children.length; ++i) {
                             create_node_byfetch(d,data.children[i]);
                           }
                         update(d);
                         centerNode(d);
                         }
                       }
                     });
             }
      },
      function(d) {
         return d.children && d.children.length > 0 ? d.children : null;
     });*/
    }

    function collapseallcore(d){
      if(root.children)
        root.children.forEach(collapse);
      collapse(root);
      update(root);
      centerNode(root);
      /* try with visitation but display errors
      visit(treeData, function(d) {
             console.log("vtrao: collapseallcore: d: "+ d);
             if(d.children) { //this node is expanded so collapse it
                   d._children = d.children;
                   d.children = null;
                   update(d);
                   centerNode(d);
               }
      },
      function(d) {
         return d.children && d.children.length > 0 ? d.children : null;
     });*/
   }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            //d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            d.y = (d.depth * 300); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .call(dragListenerDefault)
            //.call(dragListenerNew)
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", colorNode);

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", colorNode);

        // Add a context menu
        node.on('contextmenu', d3.contextMenu(menu));


        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    outer_update = function(node) {
      console.log("vtrao: outer_update: "+node);
      update(node);
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root);
    centerNode(root);
    tree_root = root;
}
