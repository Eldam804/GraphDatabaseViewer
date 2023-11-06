export interface Node {
    id: number,
    name: string,
    properties: Array<Object>,
    x?: number | undefined,
    y?: number | undefined

}

export interface Edge {
    source: any,
    target: any,
    type: string,
    linknum?: number | undefined
}
