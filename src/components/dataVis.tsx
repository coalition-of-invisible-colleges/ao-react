import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Task } from '../interfaces'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import * as d3 from 'd3'

var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 20
  },
  width = 1920 - margin.left - margin.right,
  height = 1080 - margin.top - margin.bottom;

function drawVis() {
      document.getElementById("minimap").innerHTML = "";
      console.log('drawing from ', aoStore.state.tasks.length, aoStore.member.memberId)
      var nodesX = aoStore.state.tasks
        .filter(t => t.deck.indexOf(aoStore.member.memberId) > -1)
        .map((t) => {
          return {
            id:  t.taskId,
            name: t.name
          }
        })
      nodesX.push({
          id: aoStore.member.memberId,
          name: aoStore.member.name
      })

      var linksX = []
      nodesX.forEach(n => {
        const taskId = aoStore.hashMap.get(n.id)?.taskId
        if(!taskId) {
          return 
        }
        let t = aoStore.hashMap.get(taskId)
        let source = n.id
        let subs = t.subTasks.concat(t.priorities)//.concat(t.completed)
        subs.forEach(target => {
          const subTaskId = aoStore.hashMap.get(target)?.taskId
          if(!subTaskId) {
             return
          }
          if (aoStore.hashMap.get(subTaskId).deck.indexOf(aoStore.member.memberId) > -1){
              linksX.push({
                source,
                target
              })
          }
        })
      })

      var data = {
        nodes: nodesX,
        links: linksX
      }
      console.log(data.nodes.length, 'nodes &', data.links.length, 'links')
      var svg = d3.select("#minimap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr('class', 'dataVisCanvas')
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      // Initialize the links
      var link = svg
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "#fffc")

      // Initialize the nodes
      var node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 20/6)
        .style("fill", "#a280ffcc")

      // Let's list the force we wanna apply on the network
      d3.forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink() // This force provides links between nodes
          .id(function(d) {
            return d.id;
          }) // This provide  the id of a node
          .links(data.links) // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-0.5)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
        .on("end.one", ticked)
        .on("end.two", () =>{
           d3.select("#minimap").style('animation', 'fadein2 4s ease-in forwards')
           setTimeout(() => {
              d3.select("#minimap").style('animation', '')
            }, 5000)
         })

      // This function is run at each iteration of the force algorithm, updating the nodes position.
      function ticked() {
        link
          .attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });

        node
          .attr("cx", function(d) {
            return d.x + 1;
          })
          .attr("cy", function(d) {
            return d.y - 1;
          })
      }
}

interface Props {
  totalLocalTasks: number  
}

export default function AoDataVis(props: Props) {
  React.useEffect(() => {
    drawVis()
  }, [props.totalLocalTasks])
  
  return (<div id="minimap" />)
}

