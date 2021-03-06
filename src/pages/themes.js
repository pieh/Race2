import React from 'react'
import { Link, graphql } from 'gatsby'
import kebabCase from 'lodash/kebabCase'
import styled from 'styled-components'
import Layout from "../components/layout"

const ThemesBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: -999999;
  height: 100%;
  width:100%;
`

const ThemeImage = styled.div`
  height: 100%;
  color: white;
  background-position: center center;
  background-size: 100%;
  transition: all .5s;
  &:hover {
    background-size:125%;
    transition: all .5s;
  }
  background-image: ${props =>
                      props.background ? `url(${props.background})` : `none`};
`
const ThemeOverview = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40%;
  color: white;
  font-size: 16px;
  font-weight: normal;
  font-family: 'Lato';
  padding: 60px;
  line-height: 1.5;
  letter-spacing: 0.011em;
  display: flex;
  justify-content: center;
  flex-direction: column;
  background-color: rgba(37, 41, 43, 0.78);
  transition: all .3s;
  &:hover {
    transition: all .3s;
  }
  & > p {
    margin-bottom: 0;
  }
`

const ThemeComponent = ({ data }) => (
  <div style={{
    borderRadius:45,
    width: '90%',
    marginLeft:'5%',
    height: '60vh',
    marginBottom: 60,
    marginRight: 0,
    display:'inline-block',
    verticalAlign:'top',
    position:'relative',
    overflow: 'hidden',
    boxShadow: 'rgba(39, 39, 39, 0.58) 0px 3px 57px 0px'
    }}
  >
    <Link style={{textDecoration:'none'}} to={`/themes/${kebabCase(data.name)}`}>
      <ThemeImage background={data.relationships.field_theme_image && data.relationships.field_theme_image.localFile.publicURL}>
       <div className='totalDimmer'>
        <ThemeOverview dangerouslySetInnerHTML={{
                    __html: data.description && data.description.processed,
              }}  />
         
        <h4 style={{marginBottom:7.5, letterSpacing:'0.2em', fontSize:18}}>Look closer:</h4>
        <span style={{
          fontFamily: 'Lato',
          fontSize:48,
          lineHeight:1,
          textAlign: 'left',
          letterSpacing: '0.011em'
        }}>{data.name}</span>
        </div>
      </ThemeImage>
    </Link>
  </div>
)

export default ({ data, location }) => (
  <Layout location={location}>
    <div className='wrapper'>
      <ThemesBackground />
      <div style={{
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Lato',
        fontSize:36,
        fontWeight:300,
        letterSpacing: '0.04em',
        paddingTop:120,
        marginBottom: 75
      }}>
        Explore themes from the film:
      </div>
      
      {
        data.allTaxonomyTermThemes.edges.map(({ node }) => (
          <ThemeComponent data={node} />
        ))
      }

    </div>
  </Layout>
)


export const query = graphql`
  query ThemesQuery {
    
    allTaxonomyTermThemes {
      edges {
        node {
          id
          name
          description {
            processed
          }
          relationships {
            field_theme_image {
              localFile {
                publicURL
              }
            }
            subthemes: backref_field_belongs_to_theme {
              name
              id
              relationships {
                contentNodes: backref_field_belongs_to_subtheme {
                  __typename
                  ... on node__article {
                    title
                  }
                  ... on node__faq {
                    title
                  }
                  ... on node__clip {
                    title
                  }
                  ... on node__quickfact {
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
