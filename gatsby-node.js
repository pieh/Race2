const _ = require("lodash");
const kebabCase = require("lodash/kebabCase");
const path = require("path");

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `@babel/plugin-proposal-export-default-from`,
  })
}

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

 // You can delete this file if you're not using it

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage, createRedirect } = boundActionCreators;

  return new Promise((resolve, reject) => {
    const themeTemplate = path.resolve(`src/templates/theme.js`)
    const subThemeTemplate = path.resolve(`src/templates/subtheme.js`)
    const articleTemplate = path.resolve(`src/templates/article.js`)
    const clipTemplate = path.resolve(`src/templates/clip.js`)
    const interviewTemplate = path.resolve(`src/templates/interview.js`)
    const qaTemplate = path.resolve(`src/templates/qa.js`)
    
    // Query for markdown nodes to use in creating pages.
    graphql(
      `
        {
          allTaxonomyTermThemes {
            edges {
              node {
                id
                name
                relationships {
                  field_theme_image {
                    localFile {
                      publicURL
                    }
                  }
                  subthemes: backref_field_belongs_to_theme {
                    id
                    name
                  }
                }
              }
            }
          }

          allTaxonomyTermSubthemes {
            edges {
              node {
                id
                name
              }
            }
          }

          allNodeArticle {
            edges {
              node {
                id
                title
              }
            }
          }
          allNodeInterview {
            edges {
              node {
                id
                title
              }
            }
          }
          allNodeFaq {
            edges {
              node {
                id
                fields {
                  slug
                }
              }
            }
          }
          allNodeClip {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `
    ).then(result => {
      if (result.errors) {
        resolve()
        // reject(result.errors);
      }


      // Create blog posts pages.
      _.each(result.data.allTaxonomyTermThemes.edges, edge => {
        const {field_theme_image, subthemes} = edge.node.relationships;
        const {name} = edge.node;
        const themeName = name;
        const path = `/themes/${kebabCase(name)}`;
        
        subthemes.map( ({id, name}) => 
          createPage({
            path: `/subthemes/${kebabCase(name)}`, // required
            component: subThemeTemplate,
            context: {
              id,
              field_theme_image,
              theme: {
                path,
                name: themeName
              }
            },
          })
        )
        
        createPage({
          path,
          component: themeTemplate,
          context: {
            id: edge.node.id,
          },
        })
      })

      _.each(result.data.allNodeArticle.edges, edge => {
        createPage({
          path: `/articles/${kebabCase(edge.node.title)}`, // required
          component: articleTemplate,
          context: {
            id: edge.node.id,
          },
        })
      })

      _.each(result.data.allNodeInterview.edges, edge => {
        createPage({
          path: `/interviews/${kebabCase(edge.node.title)}`, // required
          component: interviewTemplate,
          context: {
            id: edge.node.id,
          },
        })
      })

      _.each(result.data.allNodeFaq.edges, edge => {
        createPage({
          path: `/qa/${edge.node.fields.slug}`, // required
          component: qaTemplate,
          context: {
            id: edge.node.id,
          },
        })
      })

      _.each(result.data.allNodeClip.edges, edge => {
        createPage({
          path: `/clips/${kebabCase(edge.node.title)}`, // required
          component: clipTemplate,
          context: {
            id: edge.node.id,
          },
        })
      })
      
      resolve()
    })
  })
}

const usedSlugs = {}
const createSlug = ({ text, type, maxWords = 10 }) => {
  let slug = kebabCase(text.split(' ').slice(0, maxWords).join(' '))
  
  // create map of used slugs for type if it doesn't yet exist
  if (!usedSlugs[type]) {
    usedSlugs[type] = {}
  }

  // check if we already used that slug
  if (usedSlugs[type][slug]) {
    // increment count and use it as postfix
    let count = usedSlugs[type][slug] = usedSlugs[type][slug] + 1
    return `${slug}-${count}`
  } else {
    usedSlugs[type][slug] = 1
    return slug
  }
}

exports.onCreateNode = ({node, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === 'node__faq') {
    createNodeField({
      node,
      name: "slug",
      value: createSlug({
        text: node.title,
        type: "faq"
      })
    })
  }
}