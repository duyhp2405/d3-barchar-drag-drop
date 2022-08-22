import { axisBottom, axisLeft, scaleBand, scaleLinear, select, drag } from "d3";
import { useEffect, useRef, useState } from "react";

function App() {
  const w = 400;
  const h = 300;
  const [data, setData] = useState([100, 300, 200, 50, 30]);
  const svgRef = useRef(null);
  const [svg, setSvg] = useState(null);
  const [xScale, setXScale] = useState(null);
  const [yScale, setYScale] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const curSvg = select(svgRef.current)
      .attr("width", w)
      .attr("height", h)
      .style("overflow", "visible")
      .style("padding-top", "100px")
      .style("padding-left", "50px");
    setSvg(curSvg);

    const curXScale = scaleBand()
      .domain(data.map((val, i) => i))
      .range([0, w])
      .padding(0.5);
    setXScale((prev) => curXScale);

    const curYScale = scaleLinear().domain([0, h]).range([h, 0]);
    setYScale((prev) => curYScale);

    const xAxis = axisBottom(curXScale).ticks(data.length);
    const yAxis = axisLeft(curYScale).ticks(5);
    curSvg.append("g").attr("transform", `translate( 0,${h})`).call(xAxis);
    curSvg.append("g").call(yAxis);
  }, [svgRef]);

  const update = () => {
    if (!svg || !xScale || !yScale) return;

    svg
      .selectAll("rect.bar")
      .data(data)
      .join(
        (enter) => {
          return enter
            .append("rect")
            .classed("bar", true)
            .attr("x", (v, i) => xScale(i))
            .attr("y", yScale)
            .attr("width", xScale.bandwidth())
            .attr("height", (val) => h - yScale.invert(val))
            .style("fill", "orange");
        },
        (update) => {
          return update
            .attr("x", (v, i) => xScale(i))
            .attr("y", yScale)
            .attr("width", xScale.bandwidth())
            .attr("height", (val) => h - yScale.invert(val))
            .style("fill", "orange");
        }
      );

    svg
      .selectAll("rect.label")
      .data(data)
      .join(
        (enter) => {
          return enter
            .append("rect")
            .classed("label", true)
            .attr("x", (v, i) => xScale(i))
            .attr("y", yScale)
            .attr("width", xScale.bandwidth())
            .attr("height", 4)
            .style("cursor", "ns-resize")
            .style("fill", "red")
            .call(
              drag().on("drag", (event, d) => {
                const index = data.indexOf(d);
                if (index === -1) return;
                const newData = [...data];
                newData[index] = Math.floor(yScale.invert(event.y));
                setData(newData);
              })
            );
        },
        (update) => {
          return update.attr("y", yScale);
        }
      );
  };

  useEffect(() => {
    update();
  }, [data, svg, xScale, yScale]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default App;
