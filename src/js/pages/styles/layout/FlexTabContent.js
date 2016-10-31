import React from 'react';
import {routerShape} from 'react-router';
import SidebarActions from '../../../events/SidebarActions';

class FlexTabContent extends React.Component {

  render() {

    let codeBlockFlexOptionsDirection =
`<div class="flex flex-direction-left-to-right">
  …
</div>`;
    let codeBlockFlexOptionsWrapItems =
`<div class="flex flex-wrap-items">
  …
</div>`;
    let codeBlockFlexOptionsAlignItems =
`<div class="flex flex-align-items-end">
  …
</div>`;
    let codeBlockFlexOptionsJustifyItems =
`<div class="flex flex-justify-items-space-around">
  …
</div>`;
    let codeBlockFlexOptionsAlignContent =
`<div class="flex flex-wrap-items flex-align-content-space-between">
  …
</div>`;
    let codeBlockFlexItemAlign =
`<div class="flex flex-align-items-end">
  …
  <div class="flex-item-align-start">
    3
  </div>
  …
</div>`;
    let codeBlockFlexItemOrder =
`<div class="flex flex-direction-left-to-right">
  <div class="flex-item-order-3">
    1
  </div>
  <div>
    2
  </div>
  <div class="flex-item-order-4">
    3
  </div>
  <div>
    4
  </div>
</div>`;
    let codeBlockFlexItemGrow =
`<div class="flex">
  <div class="flex-item-grow-2">
    1
  </div>
  <div class="flex-item-grow-1">
    2
  </div>
</div>`;
    let codeBlockFlexItemShrink =
`<div class="flex">
  <div class="flex-item-shrink-2" style="width: 1000px;">
    1
  </div>
  <div class="flex-item-shrink-1" style="width: 1000px;">
    2
  </div>
</div>`;
    let codeBlockFlexItemBasis =
`<div class="flex flex-direction-left-to-right">
  <div style="flex-basis: 100px;">
    1
  </div>
  <div style="flex-basis: 50px;">
    2
  </div>
  <div class="flex-item-grow-1">
    3
  </div>
  <div style="flex-basis: 100px;">
    4
  </div>
</div>`;
    let codeBlockFlexResponsive =
`<div class="flex flex-direction-top-to-bottom flex-direction-left-to-right-screen-medium flex-align-items-stretch">
  <div class="flex-item-grow-3-screen-medium flex-item-order-3-screen-medium">
    1
  </div>
  <div class="flex-item-grow-2-screen-medium flex-item-order-2-screen-medium">
    2
  </div>
  <div class="flex-item-grow-1-screen-medium flex-item-order-0-screen-medium">
    3
  </div>
  <div class="flex-item-grow-4-screen-medium flex-item-order-1-screen-medium flex-item-order--1-screen-jumbo">
    4
  </div>
</div>`;

    return (

      <div>

        <p className="lead">

          CNVS provides a number of available classes for quickly assigning flex box behavior to your layout through the use of the Flex layout toolkit. Flexbox (or "Flexible Box") provides an efficient set of styles for positioning, aligning, and distributing space among items in a container.

        </p>

        <p>

          The flex box model provides an improvement over the block model in that it does not use floats, nor do the flex container's margins collapse with the margins of its contents.  In the flex layout model, the children of a flex container can be laid out in any direction, and can “flex” their sizes, either growing to fill unused space or shrinking to avoid overflowing the parent. Both horizontal and vertical alignment of the children can be easily manipulated. Nesting of these boxes (horizontal inside vertical, or vertical inside horizontal) can be used to build layouts in two dimensions.

        </p>

        <section id="flex-options">

          <h2>

            Flex Options

          </h2>

          <p>

            CNVS provides a number of available classes for quickly assigning flex box behavior to your layout.  All classes are prefixed with <code>.flex-</code>.  Classes were selected to be human-readable and don't necessarily match directly with the related styling prorperties they invoke.

          </p>

          <table className="table short">

            <thead>

              <tr>

                <th>

                  Class

                </th>

                <th>

                  Description

                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>

                  <code>

                    .flex

                  </code>

                </td>

                <td>

                  Apply flex box layout behavior to element.

                </td>

              </tr>

              <tr>

                <td>

                  <code>

                    .flex-inline

                  </code>

                </td>

                <td>

                  Apply flex box layout behavior to element, but render as inline element.

                </td>

              </tr>

            </tbody>

          </table>

          <section id="flex-direction">

            <h3>

              Direction (<code>.flex-direction-</code>)

            </h3>

            <p>

              The <code>.flex-direction-</code> property specifies the direction of the flexible items inside the flex container. The default value of flex-direction is row (left-to-right, top-to-bottom).

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .flex-direction-left-to-right

                    </code>

                    (default)

                  </td>

                  <td>

                    Arrange flex items left to right along a horizontal axis.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-direction-right-to-left

                    </code>

                  </td>

                  <td>

                    Arrange flex items right to left along a horizontal axis.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-direction-top-to-bottom

                    </code>

                  </td>

                  <td>

                    Arrange flex items top to bottom along a vertical axis.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-direction-bottom-to-top

                    </code>

                  </td>

                  <td>

                    Arrange flex items bottom to top along a vertical axis.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-direction flex flex-direction-left-to-right">
                  <div className="example-flex-item example-flex-item-1">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2">
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4">
                    4
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexOptionsDirection}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-wrap-items">

            <h3>

              Wrap Items (<code>.flex-wrap-items-</code>)

            </h3>

            <p>

              The <code>.flex-wrap-items-</code> property specifies whether the flex items should wrap or not, if there is not enough room for them on one flex line.

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .flex-wrap-items-none

                    </code>

                    (default)

                  </td>

                  <td>

                    Do not wrap the flexible items.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-wrap-items

                    </code>

                  </td>

                  <td>

                    Wrap the flexible items if needed.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-wrap-items-reverse

                    </code>

                  </td>

                  <td>

                    Wrap the flexible items in reverse order if needed.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-wrap-items flex flex-direction-left-to-right flex-wrap-items">
                  <div className="example-flex-item example-flex-item-1">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2">
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4">
                    4
                  </div>
                  <div className="example-flex-item example-flex-item-5">
                    5
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexOptionsWrapItems}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-align-items">

            <h3>

              Align Items (<code>.flex-align-items-</code>)

            </h3>

            <p>

              The <code>.flex-align-items-</code> property vertically aligns the flexible container's items when the items do not use all available space on the cross-axis.

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .flex-align-items-stretch

                    </code>

                    (default)

                  </td>

                  <td>

                    Items are stretched to fill the container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-items-start

                    </code>

                  </td>

                  <td>

                    Items are positioned along top or beginning of the container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-items-end

                    </code>

                  </td>

                  <td>

                    Items are positioned along the bottom or end of the container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-items-center

                    </code>

                  </td>

                  <td>

                    Items are centered in the container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-items-baseline

                    </code>

                  </td>

                  <td>

                    Items are aligned with the baseline of the container.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-align-items flex flex-align-items-end">
                  <div className="example-flex-item example-flex-item-1">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2">
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4">
                    4
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexOptionsAlignItems}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-justify-items">

            <h3>

              Justify Items (<code>.flex-justify-items-</code>)

            </h3>

            <p>

              The <code>.flex-justify-items-</code> property horizontally aligns the flexible container's items when the items do not use all available space on the main-axis.

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .flex-justify-items-start

                    </code>

                    (default)

                  </td>

                  <td>

                    Items are positioned at the beginning of the container with remaining space after.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-justify-items-end

                    </code>

                  </td>

                  <td>

                    Items are positioned at the end of the container with remaining space before.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-justify-items-center

                    </code>

                  </td>

                  <td>

                    Items are positioned in the center f the container with remaining space evenly on both sides.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-justify-items-space-between

                    </code>

                  </td>

                  <td>

                    Items are positioned with space evenly between them.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-justify-items-space-around

                    </code>

                  </td>

                  <td>

                    Items are positioned with space evenly around them.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-justify-items flex flex-justify-items-space-around">
                  <div className="example-flex-item example-flex-item-1">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2">
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4">
                    4
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexOptionsJustifyItems}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-align-content">

            <h3>

              Align Content (<code>.flex-align-content-</code>)

            </h3>

            <p>

              The <code>.flex-align-content-</code> property modifies the behavior of the flex item wrapping property. It is similar to <code>.flex-align-items-</code>, but instead of aligning flex items, it aligns flex lines.

            </p>

            <p>

              <strong>Note:</strong> this property has no effect when flex wrap is disabled or there is only one line of flex items.

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .flex-align-content-stretch

                    </code>

                    (default)

                  </td>

                  <td>

                    Lines stretch to take up the remaining space.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-content-start

                    </code>

                  </td>

                  <td>

                    Align lines at the start of the flex container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-content-end

                    </code>

                  </td>

                  <td>

                    Align lines at the end of the flex container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-content-center

                    </code>

                  </td>

                  <td>

                    Center lines in the flex container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-content-space-between

                    </code>

                  </td>

                  <td>

                    Lines are positioned with space evenly between them.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-align-content-space-around

                    </code>

                  </td>

                  <td>

                    Lines are evenly distributed with equal space around each line.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-align-content flex flex-direction-left-to-right flex-wrap-items flex-align-content-space-between">
                  <div className="example-flex-item example-flex-item-1">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2">
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4">
                    4
                  </div>
                  <div className="example-flex-item example-flex-item-5">
                    5
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexOptionsAlignContent}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="flex-item">

          <h2>

            Flex Item

          </h2>

          <p>

            In many projects, it is necessary to override specific flex behavior on items within the flex container.  For example, you may wish to adjust the order in the flex container, or change the alignment behavior of just one item.  The options below provide may classes prefixed with <code>.flex-item</code> to provide this item-specific support.

          </p>

          <section id="flex-item-align">

            <h3>

              Align (<code>.flex-item-align-</code>)

            </h3>

            <p>

              The <code>.flex-item-align-</code> overrides the flex container's align-items property for a specific item.  It has the same possible values as the <code>.flex-align-items</code> property.

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .flex-item-align-start

                    </code>

                  </td>

                  <td>

                    Item is positioned along top or beginning of the flex container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-item-align-end

                    </code>

                  </td>

                  <td>

                    Item is position at the bottom or end of the flex container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-item-align-center

                    </code>

                  </td>

                  <td>

                    Item is centered in the flex container.

                  </td>

                </tr>

              </tbody>

                <tr>

                  <td>

                    <code>

                      .flex-item-align-baseline

                    </code>

                  </td>

                  <td>

                    Item is aligned with the baseline of the flex container.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-item-align-stretch

                    </code>

                  </td>

                  <td>

                    Item is stretched to fill the flex container.

                  </td>

                </tr>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-item-align flex flex-align-items-end">
                  <div className="example-flex-item example-flex-item-1">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2">
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3 flex-item-align-start">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4">
                    4
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexItemAlign}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-item-order">

            <h3>

              Order (<code>.flex-item-order-*</code>)

            </h3>

            <p>

              By default, flex items are laid out in the order they appear in the source code.  The <code>.flex-item-order-*</code> property specifies the order of a flexible item relative to the rest of the flexible items inside the same container.  The <code>*</code> suffix will accept any value between <code>-100</code> and <code>100</code>.

            </p>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-item-order flex flex-direction-left-to-right">
                  <div className="example-flex-item example-flex-item-1 flex-item-order-3">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2">
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3 flex-item-order-4">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4">
                    4
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexItemOrder}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-item-grow">

            <h3>

              Grow (<code>.flex-item-grow-*</code>)

            </h3>

            <p>

              The class <code>.flex-item-grow-*</code> specifies the proportion you wish the item to grow relative to other items when there is more remaining space in the flex container than the width of the items inside.  If other items also have flex grow defined, the proportion will be calculated across all defined flex grow values. For example if there are two objects in your flex container, and the first object has class <code>.flex-item-grow-2</code>, then this object will increase it's size twice that of it's sibling.  Likewise, if the second object has class <code>.flex-item-grow-4</code>, then the first object will increase it's size at 50% (or 2/4ths) that of it's sibling.

            </p>

            <p>

              By default the flex grow property is <code>0</code>. The <code>*</code> suffix in <code>.flex-item-grow-*</code> provided by CNVS will accept any value between <code>0</code> and <code>10</code>.

            </p>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-item-grow flex flex-direction-left-to-right">
                  <div className="example-flex-item example-flex-item-1 flex-item-grow-2">
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2 flex-item-grow-1">
                    2
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexItemGrow}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-item-shrink">

            <h3>

              Shrink (<code>.flex-item-shrink-*</code>)

            </h3>

            <p>

              The class <code>.flex-item-shrink-*</code> specifies the proportion you wish the item to shrink relative to other items when there is less available space in the flex container than the width of the items inside.  If other items also have flex shrink defined, the proportion items shrinks will be calculated across all defined flex shrink values. For example if there are two objects in your flex container, and the first object has class <code>.flex-item-shrink-2</code>, then this object will decrease it's size twice that of it's sibling.  Likewise, if the second object has class <code>.flex-item-shrink-4</code>, then the first object will decrease it's size at 50% (or 2/4ths) that of it's sibling.

            </p>

            <p>

              By default the flex shrink property is <code>0</code>. The <code>*</code> suffix in <code>.flex-item-shrink-*</code> provided by CNVS will accept any value between <code>0</code> and <code>10</code>.

            </p>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-item-shrink flex flex-direction-left-to-right">
                  <div className="example-flex-item example-flex-item-1 flex-item-shrink-2" style={{flexBasis: 1000 + 'px'}}>
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2 flex-item-shrink-1" style={{flexBasis: 1000 + 'px'}}>
                    2
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexItemShrink}

                </pre>

              </div>

            </div>

          </section>

          <section id="flex-item-basis">

            <h3>

              Basis (<code>.flex-item-basis-</code>)

            </h3>

            <p>

              Flex basis defines the default size of an element before any remaining space is distributed between the items. Flex basis accepts the same values as the width and height property (e.g. 40%, 30px, etc...), plus keywords <code>auto</code> and <code>content</code>.  CNVS provides classes that allow you to define the <code>auto</code> and <code>content</code> keyword properties for an item.  However, if you wish to use a specific value, this should be defined in your project-specific styles.

            </p>

            <table className="table short">

              <thead>

                <tr>

                  <th>

                    Class

                  </th>

                  <th>

                    Description

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>

                    <code>

                      .flex-item-basis-auto

                    </code>

                  </td>

                  <td>

                    Remaining space is distributed based on its <code>flex-grow</code> value.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-item-basis-content

                    </code>

                  </td>

                  <td>

                    Remaining space is distributed based on the item's content.

                  </td>

                </tr>

                <tr>

                  <td>

                    <code>

                      .flex-item-basis-none

                    </code>

                  </td>

                  <td>

                    Remaining space is not factored in.

                  </td>

                </tr>

              </tbody>

            </table>

            <div className="panel">

              <div className="panel-cell">

                <div className="example-flex-container example-flex-item-basis flex flex-direction-left-to-right">
                  <div className="example-flex-item example-flex-item-1" style={{flexBasis: 100 + 'px'}}>
                    1
                  </div>
                  <div className="example-flex-item example-flex-item-2" style={{flexBasis: 50 + 'px'}}>
                    2
                  </div>
                  <div className="example-flex-item example-flex-item-3 flex-item-grow-1">
                    3
                  </div>
                  <div className="example-flex-item example-flex-item-4" style={{flexBasis: 100 + 'px'}}>
                    4
                  </div>
                </div>

              </div>

              <div className="panel-cell panel-cell-light panel-cell-code-block">

                <pre className="prettyprint transparent flush lang-html">

                  {codeBlockFlexItemBasis}

                </pre>

              </div>

            </div>

          </section>

        </section>

        <section id="flex-responsive">

          <h2>

            Responsive Flex Box

          </h2>

          <p>

            The flex layout system in CNVS is built to be fully responsive across all included screen-size break-points. In your specific project it may be necessary to adjust flex behavior when moving from mobile devices to desktop screens.  To apply as specific flex behavior at mini, small, medium, and large viewports, add the suffix <code>-screen-small</code>, <code>-screen-medium</code>, <code>-screen-large</code>, or <code>-screen-jumbo</code> respectively to your specific flex class.

          </p>

          <div className="panel flush-bottom">

            <div className="panel-cell">

              <div className="example-flex-container example-flex-responsive flex flex-direction-top-to-bottom flex-direction-left-to-right-screen-medium flex-align-items-stretch">
                <div className="example-flex-item example-flex-item-1 flex-item-grow-3-screen-medium flex-item-order-3-screen-medium">
                  1
                </div>
                <div className="example-flex-item example-flex-item-2 flex-item-grow-2-screen-medium flex-item-order-2-screen-medium">
                  2
                </div>
                <div className="example-flex-item example-flex-item-3 flex-item-grow-1-screen-medium flex-item-order-0-screen-medium">
                  3
                </div>
                <div className="example-flex-item example-flex-item-4 flex-item-grow-4-screen-medium flex-item-order-1-screen-medium flex-item-order--1-screen-jumbo">
                  4
                </div>
              </div>

            </div>

            <div className="panel-cell panel-cell-light panel-cell-code-block">

              <pre className="prettyprint transparent flush lang-html">

                {codeBlockFlexResponsive}

              </pre>

            </div>

          </div>

        </section>

      </div>

    );

  }
}

FlexTabContent.contextTypes = {
  router: routerShape
};

FlexTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = FlexTabContent;
