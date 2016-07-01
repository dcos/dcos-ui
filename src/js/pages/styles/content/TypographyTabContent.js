import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class TypographyTabContent extends React.Component {

  render() {
    return (
      <div>

        <section id="typography-body">

          <h2 class="flush-top">

            Body Text

          </h2>

          <p>

            Body copy, text wrapped in a simple <code>&lt;p&gt;</code> tag, lays the foundation for all other text attributes and elements.  Every element of body copy, and really any text, is definable by canvas.

          </p>

          <div class="example-block flush-bottom">

            <div class="example-block-content">

              <p class="">

                Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence without revolutionary ROI.

              </p>

              <p class="flush-bottom">

                Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

              </p>

            </div>

            <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html lang-html flush-bottom">
&lt;p&gt;
  Collaboratively administrate empowered&hellip;
&lt;/p&gt;

&lt;p&gt;
  Efficiently unleash cross-media information&hellip;
&lt;/p&gt;
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

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <p class="lead">

                  Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits.

                </p>

                <p class="flush-bottom">

                  Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

              </div>

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;p class="lead"&gt;
  Collaboratively administrate empowered&hellip;
&lt;/p&gt;

&lt;p&gt;
  Efficiently unleash cross-media information&hellip;
&lt;/p&gt;
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

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <p>

                  Efficiently unleash cross-media information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

                <p class="small flush-bottom">

                  Collaboratively administrate empowered markets via plug-and-play networks.

                </p>

              </div>

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;p&gt;
  Collaboratively administrate empowered&hellip;
&lt;/p&gt;

&lt;p class="small"&gt;
  Efficiently unleash cross-media information&hellip;
&lt;/p&gt;
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

          <div class="example-block flush-bottom">

            <div class="example-block-content">

              <h1 class="flush-top">

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

              <h6 class="flush-bottom">

                h6 Heading Text

              </h6>

            </div>

            <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;h1&gt;
  h1 Heading Text
&lt;/h1&gt;

&lt;h2&gt;
  h2 Heading Text
&lt;/h2&gt;

&lt;h3&gt;
  h3 Heading Text
&lt;/h3&gt;

&lt;h4&gt;
  h4 Heading Text
&lt;/h4&gt;

&lt;h5&gt;
  h5 Heading Text
&lt;/h5&gt;

&lt;h6&gt;
  h6 Heading Text
&lt;/h6&gt;
</pre>

            </div>

          </div>

        </section>

        <section id="typography-inline-styling">

          <h2>

            Inline Styling

          </h2>

          <p class="flush-bottom">

            For all text elements, classes are made available to adjust the styling inline.  For example, increase the emphasis of text to convey importance.

          </p>

          <section id="typography-inline-styling-emphasis">

            <h3>

              Emphasis

            </h3>

            <p>

              When you want to emphasis the importance the text, use the class <code>.emphasis</code>. All text included text elements &mdash; headings, body text, lead &mdash; had added support for emphasized text.

            </p>

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <h2 class="flush-top">

                  Heading with <span class="emphasis">emphasized</span> text

                </h2>

                <p class="lead">

                  Quickly <span class="emphasis">maximize</span> timely deliverables for deliverables without functional solutions.

                </p>

                <p class="flush-bottom">

                  Efficiently unleash <span class="emphasis">cross-media</span> information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

              </div>

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;h2 class="flush-top"&gt;
  Heading with &lt;span class="emphasis"&gt;emphasized&lt;/span&gt; text
&lt;/h2&gt;

&lt;p class="lead"&gt;
  Quickly &lt;span class="emphasis"&gt;maximize&lt;/span&gt; timely&hellip;
&lt;/p&gt;

&lt;p class="flush-bottom"&gt;
  Efficiently unleash &lt;span class="emphasis"&gt;cross-media&lt;/span&gt; inf&hellip;
&lt;/p&gt;
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

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <h2 class="flush-top">

                  Heading with <span class="muted">muted</span> text

                </h2>

                <p class="lead">

                  Quickly <span class="muted">maximize</span> timely deliverables for deliverables without functional solutions.

                </p>

                <p class="flush-bottom">

                  Efficiently unleash <span class="muted">cross-media</span> information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

                </p>

              </div>

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;h2 class="flush-top"&gt;
  Heading with &lt;span class="muted"&gt;muted&lt;/span&gt; text
&lt;/h2&gt;

&lt;p class="lead"&gt;
  Quickly &lt;span class="muted"&gt;maximize&lt;/span&gt; timely&hellip;
&lt;/p&gt;

&lt;p class="flush-bottom"&gt;
  Efficiently unleash &lt;span class="muted"&gt;cross-media&lt;/span&gt; inf&hellip;
&lt;/p&gt;
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

          <div class="example-block inverse">

            <div class="example-block-content">

              <h1 class="inverse flush-top">

                h1 Heading Text

              </h1>

              <h2 class="inverse">

                h2 Heading Text

              </h2>

              <h3 class="inverse">

                h3 Heading Text

              </h3>

              <h4 class="inverse">

                h4 Heading Text

              </h4>

              <h5 class="inverse">

                h5 Heading Text

              </h5>

              <h6 class="inverse">

                h6 Heading Text

              </h6>

              <p class="lead inverse">

                Dramatically visualize <span class="emphasis">customer</span> directed convergence without revolutionary ROI.

              </p>

              <p class="inverse">

                Collaboratively administrate empowered markets via plug-and-play networks. Dynamically procrastinate B2C users after installed base benefits. Dramatically visualize customer directed convergence without revolutionary ROI.

              </p>

              <p class="inverse flush-bottom">

                Efficiently unleash <span class="muted">cross-media</span> information without cross-media value. Quickly maximize timely deliverables for real-time schemas. Dramatically maintain clicks-and-mortar solutions without functional solutions. Completely synergize resource sucking relationships via premier niche markets.

              </p>

            </div>

            <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;h2 class="inverse"&gt;
  h2 Heading Text
&lt;/h2&gt;

&lt;p class="lead inverse"&gt;
  Dramatically visualize &lt;span class="emphasis"&gt;emphasized&lt;/span&gt; directed&hellip;
&lt;/p&gt;

&lt;p class="inverse"&gt;
  Collaboratively administrate empowered&hellip;
&lt;/p&gt;

&lt;p class="inverse"&gt;
  Efficiently unleash &lt;span class="muted"&gt;cross-media&lt;/span&gt; information&hellip;
&lt;/p&gt;
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

          <div class="example-block flush-bottom">

            <div class="example-block-content">

              <p class="text-align-left">

                Left aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p class="text-align-center">

                Center aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p class="text-align-right">

                Right aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p class="text-align-justify">

                Justify aligned text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

              <p class="text-align-nowrap">

                No wrap text. Cartibulum ercisco buglossa montepessulanus bicrotum cosidero auricolor menda boo bubo pernot io anilis lento infrequens cit circumvolutor crux. Congregalis chrysoprassos vanesco carptor galbanus veles septimpliciter corripio assuo bua arferia?

              </p>

            </div>

            <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;p class="text-align-left"&gt;
  Left aligned text.
&lt;/p&gt;

&lt;p class="text-align-center"&gt;
  Center aligned text.
&lt;/p&gt;

&lt;p class="text-align-right"&gt;
  Right aligned text.
&lt;/p&gt;

&lt;p class="text-align-justify"&gt;
  Justify aligned text.
&lt;/p&gt;

&lt;p class="text-align-nowrap"&gt;
  No wrap text.
&lt;/p&gt;
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

          <div class="example-block flush-bottom">

            <div class="example-block-content">

              <p class="text-uppercase">

                Uppercase text

              </p>

              <p class="text-lowercase">

                Lowercase text.

              </p>

              <p class="text-capitalize">

                Capitalized text.

              </p>

            </div>

            <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;p class="text-uppercase"&gt;
  Uppercase text
&lt;/p&gt;

&lt;p class="text-lowercase"&gt;
  Lowercase text.
&lt;/p&gt;

&lt;p class="text-capitalize"&gt;
  Capitalized text.
&lt;/p&gt;
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

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <ol class="flush-bottom I">

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

                    <ol class="a">

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

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;ol&gt;
  &lt;li&gt;
    &hellip;
  &lt;/li&gt;
&lt;/ol&gt;
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

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <ul class="flush-bottom">

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

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;ul&gt;
  &lt;li&gt;
    &hellip;
  &lt;/li&gt;
&lt;/ul&gt;
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

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <ul class="list-unstyled flush-bottom">

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

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;ul class="list-unstyled"&gt;
  &lt;li&gt;
    &hellip;
  &lt;/li&gt;
&lt;/ul&gt;
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

            <div class="example-block flush-bottom">

              <div class="example-block-content">

                <ul class="list-inline flush-bottom">

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

              <div class="example-block-footer example-block-footer-codeblock">

<pre class="prettyprint lang-html flush-bottom">
&lt;ul class="list-inline"&gt;
  &lt;li&gt;
    &hellip;
  &lt;/li&gt;
&lt;/ul&gt;
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
  router: React.PropTypes.func
};

TypographyTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = TypographyTabContent;
