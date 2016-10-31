import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';
// JSON.stringify(this.props.versionDump, null, 2)`


class TypographyTabContent extends React.Component {

  render() {
    let codeBlockTypographyBody =
`<p>
  Collaboratively administrate empowered…
</p>

<p>
  Efficiently unleash cross-media information…
</p>`;
    let codeBlockTypographyBodyLead =
`<p class="lead">
  Collaboratively administrate empowered…
</p>

<p>
  Efficiently unleash cross-media information…
</p>`;
    let codeBlockTypographyBodySmall =
`<p>
  Collaboratively administrate empowered…
</p>

<p class="small">
  Efficiently unleash cross-media information…
</p>`;
    let codeBlockTypographyHeadings =
`<h1>
  h1 Heading Text
</h1>

<h2>
  h2 Heading Text
</h2>

<h3>
  h3 Heading Text
</h3>

<h4>
  h4 Heading Text
</h4>

<h5>
  h5 Heading Text
</h5>

<h6>
  h6 Heading Text
</h6>`;
    let codeBlockTypographyInlineStylingEmphasis =
`<h2 className="flush-top">
  Heading with <span className="emphasis">emphasized</span> text
</h2>

<p className="lead">
  Quickly <span className="emphasis">maximize</span> timely…
</p>

<p className="flush-bottom">
  Efficiently unleash <span className="emphasis">cross-media</span> inf…
</p>`;
    let codeBlockTypographyInlineStylingMuted =
`<h2 className="flush-top">
  Heading with <span className="muted">muted</span> text
</h2>

<p className="lead">
  Quickly <span className="muted">maximize</span> timely…
</p>

<p className="flush-bottom">
  Efficiently unleash <span className="muted">cross-media</span> inf…
</p>`;
    let codeBlockTypographyInverseStyling=
`<h2 className="inverse">
  h2 Heading Text
</h2>

<p className="lead inverse">
  Dramatically visualize <span className="emphasis">emphasized</span> directed…
</p>

<p className="inverse">
  Collaboratively administrate empowered…
</p>

<p className="inverse">
  Efficiently unleash <span className="muted">cross-media</span> information…
</p>`;
    let codeBlockTypographyAlignment =
`<p className="text-align-left">
  Left aligned text.
</p>

<p className="text-align-center">
  Center aligned text.
</p>

<p className="text-align-right">
  Right aligned text.
</p>

<p className="text-align-justify">
  Justify aligned text.
</p>

<p className="text-align-nowrap">
  No wrap text.
</p>`;
    let codeBlockTypographyTransformation =
`<p className="text-uppercase">
  Uppercase text
</p>

<p className="text-lowercase">
  Lowercase text.
</p>

<p className="text-capitalize">
  Capitalized text.
</p>`;
    let codeBlockTypographyListsOrdered =
`<ol>
  <li>
    …
  </li>
</ol>`;
    let codeBlockTypographyListsUnordered =
`<ol>
  <li>
    …
  </li>
</ol>`;
    let codeBlockTypographyListsUnstyled =
`<ul className="list-unstyled">
  <li>
    …
  </li>
</ul>`;
    let codeBlockTypographyListsInline =
`<ul className="list-inline">
  <li>
    …
  </li>
</ul>`;

    return (
      <div>

        <section id="typography-body">

          <h2 className="flush-top">

            Body Text

          </h2>

          <p>

            Body copy, text wrapped in a simple <code>&lt;p&gt;</code> tag, lays the foundation for all other text attributes and elements.  Every element of body copy, and really any text, is definable by canvas.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <p className="">

                Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence without revolutionary ROI.

              </p>

              <p className="flush-bottom">

                Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

              </p>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTypographyBody}

              </pre>

            </div>

          </div>

          <section id="typography-body-lead">

            <h3>

              Lead Text

            </h3>

            <p>

              Increase the importance of your body copy by adding the class <code>.lead</code>. Lead is only a class, and not an HTML tag, but may be useful when you want to retain the semantic nature of a paragraph, but are not willing to classify it as a heading.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <p className="lead">

                  Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits.

                </p>

                <p className="flush-bottom">

                  Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyBodyLead}

                </pre>

              </div>

            </div>

          </section>

          <section id="typography-body-small">

            <h3>

              Small Text

            </h3>

            <p>

              For less important body text, add the class <code>.small</code>. Small text is useful for legal fine-print, instructional text, or supporting details.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <p>

                  Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

                <p className="small flush-bottom">

                  Collaboratively administrate empowered markets via plug-and-play networks.

                </p>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyBodySmall}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="typography-headings">

          <h2>

            Headings

          </h2>

          <p>

            All standard HTML heading tags from <code>&lt;h2&gt;</code> through <code>&lt;h6&gt;</code> are available. In addition the class <code>.h2</code> through <code>.h6</code> classes are available, for when you want to match the font styling of a heading but don't want to adjust the tag.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <h1 className="flush-top">

                h1 Heading Text

              </h1>

              <h2>

                h2 Heading Text

              </h2>

              <h3>

                h3 Heading Text

              </h3>

              <h4>

                h4 Heading Text

              </h4>

              <h5>

                h5 Heading Text

              </h5>

              <h6 className="flush-bottom">

                h6 Heading Text

              </h6>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTypographyHeadings}

              </pre>

            </div>

          </div>

        </section>

        <section id="typography-inline-styling">

          <h2>

            Inline Styling

          </h2>

          <p className="flush-bottom">

            For all text elements, classes are made available to adjust the styling inline.  For example, increase the emphasis of text to convey importance.

          </p>

          <section id="typography-inline-styling-emphasis">

            <h3>

              Emphasis

            </h3>

            <p>

              When you want to emphasis the importance the text, use the class <code>.emphasis</code>. All text included text elements &mdash; headings, body text, lead &mdash; had added support for emphasized text.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <h2 className="flush-top">

                  Heading with <span className="emphasis">emphasized</span> text

                </h2>

                <p className="lead">

                  Quickly <span className="emphasis">maximize</span> timely deliverables for deliverables without functional solutions.

                </p>

                <p className="flush-bottom">

                  Efficiently unleash <span className="emphasis">cross-media</span> information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyInlineStylingEmphasis}

                </pre>

              </div>

            </div>

          </section>

          <section id="typography-inline-styling-muted">

            <h3>

              Muted

            </h3>

            <p>

              When you want to demphasis the importance text, use the class <code>.muted</code>. All text included text elements &mdash; headings, body text, lead &mdash; had added support for muted text.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <h2 className="flush-top">

                  Heading with <span className="muted">muted</span> text

                </h2>

                <p className="lead">

                  Quickly <span className="muted">maximize</span> timely deliverables for deliverables without functional solutions.

                </p>

                <p className="flush-bottom">

                  Efficiently unleash <span className="muted">cross-media</span> information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyInlineStylingMuted}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="typography-inverse-styling">

          <h2>

            Inverse Styling

          </h2>

          <p>

            All typographic elements have support for inverted styling.  This is useful when text is resting on a dark background.  Add the class <code>.inverse</code> to any text element to leverage the inverted styling.

          </p>

          <p>

            The inverse styling even has added support for the <code>.emphasis</code> and <code>.muted</code> inline styling classes.

          </p>

          <div className="panel panel-inverse">

            <div className="panel-cell panel-cell-inverse">

              <h1 className="inverse flush-top">

                h1 Heading Text

              </h1>

              <h2 className="inverse">

                h2 Heading Text

              </h2>

              <h3 className="inverse">

                h3 Heading Text

              </h3>

              <h4 className="inverse">

                h4 Heading Text

              </h4>

              <h5 className="inverse">

                h5 Heading Text

              </h5>

              <h6 className="inverse">

                h6 Heading Text

              </h6>

              <p className="lead inverse">

                Dramatically visualize <span className="emphasis">customer</span> directed convergence without revolutionary ROI.

              </p>

              <p className="inverse">

                Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence without revolutionary ROI.

              </p>

              <p className="inverse flush-bottom">

                Efficiently unleash <span className="muted">cross-media</span> information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

              </p>

            </div>

            <div className="panel-cell panel-cell-dark panel-cell-inverse panel-cell-code-block">

              <pre className="prettyprint code-block-inverse transparent flush lang-html">

                {codeBlockTypographyInverseStyling}

              </pre>

            </div>

          </div>

        </section>

        <section id="typography-text-alignment">

          <h2>

            Alignment

          </h2>

          <p>

            Align text using the supplied alignment classes.  By default text is aligned left.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <p className="text-align-left">

                Left aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p className="text-align-center">

                Center aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p className="text-align-right">

                Right aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p className="text-align-justify">

                Justify aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p className="text-align-nowrap">

                No wrap text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTypographyAlignment}

              </pre>

            </div>

          </div>

        </section>

        <section id="typography-text-transformation">

          <h2>

            Transformation

          </h2>

          <p>

            Transform text in components with text capitalization classes.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <p className="text-uppercase">

                Uppercase text

              </p>

              <p className="text-lowercase">

                Lowercase text.

              </p>

              <p className="text-capitalize">

                Capitalized text.

              </p>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockTypographyTransformation}

              </pre>

            </div>

          </div>

        </section>

        <section id="typography-lists">

          <h2>

            Lists

          </h2>

          <p>

            Align text using the supplied alignment classes.  By default text is aligned left.

          </p>

          <section id="typography-lists-ordered">

            <h3>

              Ordered Lists

            </h3>

            <p>

              A list of items in which the order does explicitly matter.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <ol className="flush-bottom I">

                  <li>

                    Lorem ipsum dolor sit amet

                  </li>

                  <li>

                    Consectetur adipiscing elit

                  </li>

                  <li>

                    Integer molestie lorem at massa

                  </li>

                  <li>

                    Facilisis in pretium nisl aliquet

                  </li>

                  <li>

                    Nulla volutpat aliquam velit

                    <ol className="a">

                      <li>

                        Phasellus iaculis neque

                      </li>

                      <li>

                        Purus sodales ultricies

                      </li>

                      <li>

                        Vestibulum laoreet porttitor sem

                      </li>

                      <li>

                        Ac tristique libero volutpat at

                      </li>

                    </ol>

                  </li>

                  <li>

                    Faucibus porta lacus fringilla vel

                  </li>

                  <li>

                    Aenean sit amet erat nunc

                  </li>

                  <li>

                    Eget porttitor lorem

                  </li>

                </ol>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyListsOrdered}

                </pre>

              </div>

            </div>

          </section>

          <section id="typography-lists-unordered">

            <h3>

              Unordered Lists

            </h3>

            <p>

              A list of items in which the order does not explicitly matter.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <ul className="flush-bottom">

                  <li>

                    Lorem ipsum dolor sit amet

                  </li>

                  <li>

                    Consectetur adipiscing elit

                  </li>

                  <li>

                    Integer molestie lorem at massa

                  </li>

                  <li>

                    Facilisis in pretium nisl aliquet

                  </li>

                  <li>

                    Nulla volutpat aliquam velit

                    <ul>

                      <li>

                        Phasellus iaculis neque

                      </li>

                      <li>

                        Purus sodales ultricies

                      </li>

                      <li>

                        Vestibulum laoreet porttitor sem

                      </li>

                      <li>

                        Ac tristique libero volutpat at

                      </li>

                    </ul>

                  </li>

                  <li>

                    Faucibus porta lacus fringilla vel

                  </li>

                  <li>

                    Aenean sit amet erat nunc

                  </li>

                  <li>

                    Eget porttitor lorem

                  </li>

                </ul>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyListsUnordered}

                </pre>

              </div>

            </div>

          </section>

          <section id="typography-lists-unstyled">

            <h3>

              Unstyled Lists

            </h3>

            <p>

              Remove the default list-style and left margin on list items (immediate children only). This only applies to immediate children list items, meaning you will need to add the class for any nested lists as well.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <ul className="list-unstyled flush-bottom">

                  <li>

                    Lorem ipsum dolor sit amet

                  </li>

                  <li>

                    Consectetur adipiscing elit

                  </li>

                  <li>

                    Integer molestie lorem at massa

                  </li>

                  <li>

                    Facilisis in pretium nisl aliquet

                  </li>

                  <li>

                    Nulla volutpat aliquam velit

                    <ul>

                      <li>

                        Phasellus iaculis neque

                      </li>

                      <li>

                        Purus sodales ultricies

                      </li>

                      <li>

                        Vestibulum laoreet porttitor sem

                      </li>

                      <li>

                        Ac tristique libero volutpat at

                      </li>

                    </ul>

                  </li>

                  <li>

                    Faucibus porta lacus fringilla vel

                  </li>

                  <li>

                    Aenean sit amet erat nunc

                  </li>

                  <li>

                    Eget porttitor lorem

                  </li>

                </ul>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyListsUnstyled}

                </pre>

              </div>

            </div>

          </section>

          <section id="typography-lists-inline">

            <h3>

              Inline Lists

            </h3>

            <p>

              Display list <code>&lt;li&gt;</code> inline rather than vertical stacked using the class <code>.list-inline</code> on any <code>&lt;ul&gt;</code> or <code>&lt;ol&gt;</code>.

            </p>

            <div className="panel flush-bottom">

              <div className="panel-cell">

                <ul className="list-inline flush-bottom">

                  <li>

                    List item

                  </li>

                  <li>

                    List item

                  </li>

                  <li>

                    List item

                  </li>

                  <li>

                    List item

                  </li>

                  <li>

                    List item

                  </li>

                </ul>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockTypographyListsInline}

                </pre>

              </div>

            </div>

          </section>

        </section>

      </div>
    );
  }
}

TypographyTabContent.contextTypes = {
  router: routerShape
};

TypographyTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = TypographyTabContent;
