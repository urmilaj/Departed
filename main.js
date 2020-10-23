function viz(){
        const margin = { top:5, left: 50, bottom: 30, right: 100 },
    width = 960,
    height = 1600; 

    const svg = d3.select("body")
                .append("svg").attr("viewBox",[0,0,width,height]).attr("class","viz")
                .append("g").attr("transform","translate(120,60)")

                
  d3.csv("data/20th_Century.csv",function(d){
      return{
          category : d.category,
          sub_category : d.sub_category,
          details : d.details,
          value : +d.value,
      }
  }).then(function(data){
      console.log(data)
      
      const groups = d3.group(data,d=>d.category,d=>d.sub_category)

      const hierarchy = d3.hierarchy(groups)

      pack = () => d3.pack()
         .size([700,height])
         .padding(0.05)
         (hierarchy.sum(d=>Math.sqrt(d.value)))

      root = pack()

      const color = d3.scaleOrdinal()
                      .range(["#555555","#a90000","#555555","#a90000","#555555","#a90000","#555555","#a90000",
                      "#555555","#a90000","#555555","#a90000","#555555","#a90000","#555555","#a90000"])
      
      const x = d3.scaleBand()
      .domain(data.map(d=>d.sub_category))
      .range([margin.left,width-margin.right])

      const y = d3.scaleBand()
                  .domain(data.map(d=>d.category))
                  .range([height,margin.left])
      
      const circle = svg.append("g").selectAll("circle").data(root.leaves())
                        .join("circle").attr("class","circle")
                        .attr("r",d=>d.r)
                        .style("stroke","black")
                        .attr("stroke-width","1")
                        .attr("fill",d=>color(d.data.category))
                        
      svg.append("g").selectAll("text").attr("class","label")
         .data(data).enter().append("text").attr("y",d=>y(d.category))
         .text(d=>d.category).style("font-family","Times").style("font-size","22px")

         const simulation = d3.forceSimulation()
                 .force("x",d3.forceX(d=>x(d.data.sub_category)).strength(0.08))
                 .force("y",d3.forceY(d=>y(d.data.category)).strength(30))
                 .force("charge",d3.forceManyBody().strength(0.01))
                 .force("collide",d3.forceCollide().strength(1.5).radius(d=>d.r))
                 .alpha(0.01)
                 .alphaDecay(0.02)
          
        simulation.nodes(root.leaves())
                .on("tick",d=>circle.attr("cx",d=>d.x=Math.max(d.r,Math.min(width-d.r,d.x)))
                          .attr("cy",d=>d.y=Math.max(d.r,Math.min(height-d.r,d.y))))
                .on("end",tip)   
                
                function tip(d){
                  const annotation = (root.leaves()).map(d=>{
        return{
          data:d,
          x:d.x,
          y:d.y,
          dx:0,
          dy:-30,
          color:color(d.data.category),
          note:{
            label:d.data.details+": "+parseInt(d.data.value)+" deaths",
            bgPadding:3,
            align:"middle"
        },
        subject:{
          radius:d.r
        }
      }})
      
      let makeAnnot = d3.annotation()
                          .type(d3.annotationCalloutCircle)
                          .annotations(annotation)
                          .on("subjectover",function(annotation) {
    annotation.type.a.selectAll("g.annotation-connector,g.annotation-note")
      .classed("hidden", false)
  })
  .on('subjectout', function(annotation) {
    annotation.type.a.selectAll("g.annotation-connector,g.annotation-note")
      .classed("hidden", true)
  })

  svg.append("g").call(makeAnnot);      
  svg.selectAll("g.annotation-connector,g.annotation-note").classed("hidden", true) 
                }
  })
}
