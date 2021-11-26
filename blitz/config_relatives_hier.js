
{
  node: {
    caption: ['name'],
    defaultIcon: true,
    onDoubleClick: (n) => window.open(n.url, '_blank'),
    onClick: (n) => {
      blitzboard.showLoader();

      let query = `
      select ?url ?date ?name ?thumb where  {
        wd:${n.id} wdt:P40 ?url.
        ?url wdt:P31 wd:Q5 ;
             wdt:P569 ?date ;
             rdfs:label ?name .
        OPTIONAL {
          ?url wdt:P18 ?thumb .
        }
        FILTER(lang(?name) = 'ja')
      }
      `;

      let query2 = `
      select ?url ?date ?name ?thumb where  {
        ?url wdt:P40 wd:${n.id} .
        ?url wdt:P31 wd:Q5 ;
             wdt:P569 ?date ;
             rdfs:label ?name .
        OPTIONAL {
          ?url wdt:P18 ?thumb .
        }
        FILTER(lang(?name) = 'ja')
      }
      `;
      
      $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
        for (let b of result.results.bindings) {
          let id = b.url.value.replace(/.*\//g, '');
          let node = {
            id: id,
            labels: ['Human'],
            properties: {
              url: [b.url.value],
              name: [b.name.value],
              birth: [b.date.value],
              death: [b.date.value],
            }
          };
          if (b.thumb?.value) {
            node.properties.thumbnail = [b.thumb.value];
          }
          blitzboard.addNode(node, false);
          if (!blitzboard.hasEdge(n.id, node.id)) {
            blitzboard.addEdge({
              from: n.id,
              to: node.id,
              labels: ['child'],
            });
          }
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });
      
      $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query2)}&format=json`, (result) => {
        for (let b of result.results.bindings) {
          let id = b.url.value.replace(/.*\//g, '');
          if (blitzboard.hasNode(id)) {
            continue;
          }
          let node = {
            id: id,
            labels: ['Human'],
            properties: {
              url: [b.url.value],
              name: [b.name.value],
              birth: [b.date.value],
              death: [b.date.value],
            }
          };
          if (b.thumb?.value) {
            node.properties.thumbnail = [b.thumb.value];
          }
          blitzboard.addNode(node, false);
          if (!blitzboard.hasEdge(node.id, n.id)) {
            blitzboard.addEdge({
              from: node.id,
              to: n.id,
              labels: ['child'],
            });
          }
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });
    
    }

  },
  edge: {
    caption: ['label'],
  },
  layout: 'hierarchical',
  layoutSettings: {
    enabled:true,
    levelSeparation: 150,
    nodeSpacing: 100,
    treeSpacing: 200,
    blockShifting: true,
    edgeMinimization: true,
    parentCentralization: true,
    direction: 'UD',        // UD, DU, LR, RL
    sortMethod: 'directed',  // hubsize, directed
    shakeTowards: 'leaves'  // roots, leaves
  },
}
