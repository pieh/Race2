const React = require('react')
import styled, { css } from 'styled-components'
import {
  getCards,
  QuickFactCard,
  FAQCard,
  ClipCard,
  ArticleCard
} from '../components/subtheme'
import Portal from '../components/overlay'
const queryString = require('query-string');
import kebabCase from 'lodash/kebabCase'
import { navigateTo } from 'gatsby-link';

// const MainContent = styled.div`
//   max-width: 700px;
//   margin-left: 48%;
//   margin-right: 12%;
// `
const LargeCalloutText = styled.div`

`
const ArticleHeader = styled.div`
  width: 100%;
  height: 33vh;
  background-image: ${props =>
    props.background ? `url(${props.background})` : `none`};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: lightgrey;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -999;
`

const ArticleMain = styled.div`
  background-color: white;
  padding: 30px;
`
const ArticleTitle = styled.div`
    font-size: 42px;
    font-family: 'Lato';
    margin-bottom: 30px;
    line-height: 1.3;
    text-align: right;
`

const Overlay = styled.div`
  background-color: #FFFFE0;
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index:999999999999999999999999;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.blue && css`
    background-color: #f1efefdb;
  `}
`

const Centered = styled.div`
  width: 50%;
  padding: 20px;
  ${props => props.wide && css`
    width: 80%;
  `}
`
class QuickFactOverlay extends React.Component {
  render() {
    const { quickFact } = this.props

    const quickClips = quickFact.relationships.field_related_content || [];

    const quickClipLinks = {
      articles: [],
      clips: [],
      faqs: [],
      quickFacts: []
    }

    quickClips.forEach(item => {
      if (item.__typename == `node__faq`) {
        quickClipLinks.faqs.push(item)
      } else if (item.__typename == `node__article`) {
        quickClipLinks.articles.push(item)
      } else if (item.__typename == `node__clip`) {
        quickClipLinks.clips.push(item)
      }
    })

    return (
      <Portal>
        <Overlay>
          <Centered>
            <div onClick={this.props.closeHandler} style={{float: `right`, color: `red`, cursor: `pointer`}}>
              <b>Close</b>
            </div>
            <h3>{quickFact.title}</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: quickFact.field_quickfact.processed,
              }}
            />
            <div style={{ width: `100%`, display: `flex`, }}>
              {
                getCards(quickClipLinks, {}, null, true).slice(0,2)
              }
            </div>
          </Centered>
        </Overlay>
      </Portal>
    )
  }
}

class TagOverlay extends React.Component {
  render() {
    const { tag, queryParams = {} } = this.props

    const quickClipLinks = {
      articles: tag.relationships.backref_field_tags_node_article ,
      faqs: tag.relationships.backref_field_tag_node_faq,
      clips: tag.relationships.backref_field_t_node_clip,
      quickFacts: []
    }

    return (
      <Portal>
        <Overlay blue>
          <Centered wide>
            <div style={{position: 'fixed', width: 'calc(80% - 40px)'}}>
            <div onClick={this.props.closeHandler} style={{float: `right`, color: `red`, cursor: `pointer`}}>
              <b>Close</b>
            </div>
            <h2>{tag.name}</h2>
            {
              [`faq`, `article`, `clip`].map(articleType => (
                <span
                  style={{ marginRight: 20, cursor: `pointer` }}
                  onClick={ () => {
                    const newQueryParams = { ... queryParams }
                    if (newQueryParams[`type`] == articleType){
                      delete newQueryParams[`type`]
                    } else {
                      newQueryParams[`type`] = articleType;
                    }
                    navigateTo(`?${queryString.stringify(newQueryParams)}`)
                  }}
                >
                  { articleType }
                </span>
              ))
            }
            </div>
            
            <div style={{ width: `100%`, display: 'flex', 'flex-wrap': 'wrap', height: `80vh`, marginTop: 100}}>
              {
                getCards(quickClipLinks, queryParams[`type`], null, true)
              }
            </div>
          </Centered>
        </Overlay>
      </Portal>
    )
  }
}

class SingleArticle extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { data } = this.props
    const queryParams = queryString.parse(this.props.location.search);
    const quickFact = queryParams.quickfact ?
      (data.nodeArticle.relationships.field_article_related_content || []).filter(node => (node.__typename === `node__quickfact` && kebabCase(node.title) == queryParams.quickfact)
      )[0] :
      null

    console.log(`quickfact`)
    console.log(quickFact)

    const tag = queryParams.tag ?
      (data.nodeArticle.relationships.field_tags || []).filter(tag => (kebabCase(tag.name) == queryParams.tag)
      )[0] :
      null

    return (
      <div className="row" style={{ overflowY: queryParams.tag ? "hidden" : "auto" }}>
        {
          queryParams.quickfact ?
            <QuickFactOverlay
              quickFact={quickFact}
              closeHandler={() => {
                navigateTo(`?`)
              }}
            /> :
            null
        }
        {
          queryParams.tag ?
            <TagOverlay
              queryParams={queryParams}
              tag={tag}
              closeHandler={() => {
                navigateTo(`?`)
              }}
            /> :
            null
        }
        <ArticleHeader
          background={
            data.nodeArticle.relationships.field_main_image &&
            data.nodeArticle.relationships.field_main_image.localFile.publicURL
          }
        />
          <div className="column _25">
          </div>
          <div style={{
            textAlign: 'right'
          }} className="column">
          <img style={{
            width:300,
            marginTop:'12vh',

          }} src={
             data.nodeArticle.relationships.field_author_image &&
             data.nodeArticle.relationships.field_author_image.localFile.publicURL
          } />
            <ArticleTitle>{data.nodeArticle.title}</ArticleTitle>
            {
              (data.nodeArticle.relationships.field_tags || []).map(tag =>
                <span className={'tag'}
                  onClick={()=>{
                    const newQueryParams = { ...queryParams, tag: kebabCase(tag.name) }
                    navigateTo(`?${queryString.stringify(newQueryParams)}`)
                  }}
                >
                  <b>{tag.name}</b>
                </span>
              )
            }
            <div style={{height: 200}}/>
            <button onClick={() => { this.setState({ teaching: false}) }}>
              All Content
            </button>
            <button onClick={() => { this.setState({ teaching: true}) }}>
              Teaching
            </button>
            {
              (data.nodeArticle.relationships.field_article_related_content || [])
              .filter(node => (!this.state.teaching || node.field_include_in_the_teaching_se) )
              .map((node, i) => {
                  if (node.__typename == `node__quickfact`) {
                    return (
                      <QuickFactCard
                        onClick={() => {
                          console.log(node.title)
                          const newQueryParams = { ...queryParams, quickfact: kebabCase(node.title) }
                          navigateTo(`?${queryString.stringify(newQueryParams)}`)
                        }}
                        quickfact={node}
                        i={i}
                        style={{ cursor: `pointer`, border: `1px solid #888888`, padding: 20}}
                      />
                    )
                  } else if (node.__typename == `node__article`) {
                    return (
                      <ArticleCard
                        i={i}
                        article={node}
                        relatedContent
                      />
                    )
                  } else if (node.__typename == `node__faq`) {
                    return (
                      <FAQCard
                        i={i}
                        faq={node}
                      />
                    )
                  } else if (node.__typename == `node__clip`) {
                    return (
                      <ClipCard
                        i={i}
                        clip={node}
                        playable
                      />
                    )
                  }
                }
              )
            }
          </div>

          <ArticleMain className="column _60">
            <LargeCalloutText style={{
              fontSize: 28,
              fontWeight: 'normal',
              lineHeight: 1.5
            }}
              dangerouslySetInnerHTML={{
                __html: data.nodeArticle.field_large_callout_text.processed,
              }}
            />
            <div style={{lineHeight:1.7}}
              dangerouslySetInnerHTML={{
                __html: data.nodeArticle.field_full_version.processed,
              }}
            />
          </ArticleMain>
          <div className="column _25" />

      </div>
    )
  }
}

export default SingleArticle

export const pageQuery = graphql`
  query singleQuery($id: String) {
    nodeArticle(id: { eq: $id }) {
      id
      title
      relationships {
        field_article_related_content {
          __typename
          ... on node__faq {
            ...FAQFragment
          }
          ... on node__clip {
            ...PosterImageClipFragment
          }
          ... on node__article {
            ...ArticleFragment
          }
          ... on node__quickfact {
            ...QuickfactWithRelatedContentFragment
          }
        }
        field_tags {
          name
          relationships {
            backref_field_tags_node_article {
              ...ArticleFragment
            }
            backref_field_tag_node_faq {
              ...FAQFragment
            }
            backref_field_t_node_clip {
              ...PosterImageClipFragment
            }
          }
        }
        field_author_image {
          localFile {
            publicURL
          }
        }
        field_main_image {
          localFile {
            publicURL
          }
        }
      }
      field_large_callout_text {
        processed
      }
      field_full_version {
        processed
      }
    }
  }
`