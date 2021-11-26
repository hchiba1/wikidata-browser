
{
  node: {
    caption: ['name'],
    defaultIcon: true,
    onDoubleClick: (n) => window.open(n.url, '_blank'),
    onClick: (n) => {
      blitzboard.showLoader();
      let query = `
      select ?url ?date ?name ?propLabel ?thumb where  {
        wd:${n.id} ?link ?url.
        ?url wdt:P31 wd:Q5 ;
             wdt:P569 ?date ;
             rdfs:label ?name .
        OPTIONAL {
          ?url wdt:P18 ?thumb .
        }
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "en".
        } 
        ?prop wikibase:directClaim ?link .
        FILTER(lang(?name) = 'ja')
      }
      `;
      
      $.get(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`, (result) => {
        for(let b of result.results.bindings) {
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
          blitzboard.addEdge({
            from: n.id,
            to: node.id,
            labels: [b.propLabel.value],
          })
        }
        blitzboard.update();
        blitzboard.hideLoader();
      });
    
    }

  },
  edge: {
    caption: ['label'],
  },
  layout: 'timeline', 
  layoutSettings: {
    time_from: "birth",
    time_to: "death"
  }
}
